import { injectable } from "inversify";
import Token from "../../Models/Token";
import { ILeaveRequestRepository, LeaveRequestDTO } from "../ILeaveRequestRepository";
import { BaseRepository } from "./BaseRepository";
import { LeaveDay, LeaveRequest } from "../../Models";
import { RecordNotFoundError } from "../../Errors";
import { where } from "sequelize";
import Loader from "../../Loaders";
import { LeaveRequestStatus } from "../../Constants";

@injectable()
export class LeaveRequestRepository
	extends BaseRepository<LeaveRequest>
	implements ILeaveRequestRepository
{
	constructor() {
		super(LeaveRequest);
	}
	public async all() {
		const result = await this._model.findAll({
			include: { model: LeaveDay, as: "leaveDays" },
		});
		return this.parseLeaveDay(result);
	}

	public async findById(id: number): Promise<LeaveRequest | null> {
		const result = await this._model.findByPk(id, {
			include: { model: LeaveDay, as: "leaveDays" },
			logging: console.log,
		});
		if (!result) {
			throw new RecordNotFoundError();
		}
		return this.parseLeaveDay([result])[0];
	}

	public async create(data: LeaveRequestDTO) {
		const leaveRequestData = {
			...data,
			leaveDays: data.leaveDays.map((item: string) => ({ date: item })),
		};
		console.log(leaveRequestData);
		const result = await this._model.create(leaveRequestData, {
			include: { model: LeaveDay, as: "leaveDays" },
		});
		return this.parseLeaveDay([result])[0];
	}

	public async update(id: number, data: LeaveRequestDTO) {
		const { userId, leaveDays: rawLeaveDays, ...leaveRequestData } = data;
		const leaveDays = (rawLeaveDays || []).map((item: string) => ({ date: item }));

		const transaction = await Loader.sequelize.transaction();

		try {
			const leaveRequest = await this._model.findOne({
				where: { id, userId },
				include: { model: LeaveDay, as: "leaveDays" },
				transaction,
			});

			if (!leaveRequest) {
				throw new RecordNotFoundError();
			}

			if (leaveDays.length > 0) {
				// remove associations and destroy old leaveDays
				const oldLeaveDays = await leaveRequest.getLeaveDays({ transaction });
				await Promise.all(
					oldLeaveDays.map((item) => item.destroy({ transaction })),
				);

				// create new leaveDays
				const newLeaveDayItems: LeaveDay[] = await Promise.all(
					leaveDays.map(async (item: any) => {
						const result = await leaveRequest.createLeaveDay(item, {
							transaction,
						});
						if (!result) {
							throw new Error();
						}
						return result;
					}),
				);

				// set new leaveDays for leave Request
				await leaveRequest.setLeaveDays(newLeaveDayItems, { transaction });
			}

			// update leaveRequestData
			await leaveRequest.update(leaveRequestData, { transaction });

			// save and commit the transaction
			await transaction.commit();

			// Reload the model to get the updated associations
			return this.parseLeaveDay([leaveRequest])[0];
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async updateStatus(id:number, status: LeaveRequestStatus) {
		return await this._model.update({status}, {where: {id}})
	}

	// public async checkValidLeaveRequest(id:number) {

	// }

	private parseLeaveDay = (leaveRequests: LeaveRequest[]) => {
		const result = leaveRequests.map((leaveRequest: any) => {
			const leaveRequestJSON = leaveRequest.toJSON();
			return {
				...leaveRequestJSON,
				leaveDays: leaveRequestJSON.leaveDays.map(
					(leaveDay: any) => leaveDay.date,
				),
			};
		});

		return result;
	};
}
