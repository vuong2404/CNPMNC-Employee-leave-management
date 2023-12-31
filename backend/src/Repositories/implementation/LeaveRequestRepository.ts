import { injectable } from "inversify";
import Token from "../../Models/Token";
import { ILeaveRequestRepository, LeaveRequestDTO } from "../ILeaveRequestRepository";
import { BaseRepository } from "./BaseRepository";
import { LeaveDay, LeaveRequest, User } from "../../Models";
import { RecordNotFoundError } from "../../Errors";
import { Transaction, where } from "sequelize";
import Loader from "../../Loaders";
import { LeaveRequestStatus } from "../../Constants";
import moment from "moment";

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
			include: [{ model: User }, { model: LeaveDay, as: "leaveDays" }],
		});
		return result;
	}

	public async findById(id: number): Promise<LeaveRequest | null> {
		const result = await this._model.findByPk(id, {
			include: { model: LeaveDay, as: "leaveDays" },
		});
		if (!result) {
			throw new RecordNotFoundError();
		}
		return result;
	}

	public async create(data: LeaveRequestDTO) {
		const leaveRequestData = {
			...data,
			leaveDays: data.leaveDays.map((item: string) => ({ date: item })),
		};
		// console.log(leaveRequestData);
		const result = await this._model.create(leaveRequestData, {
			include: { model: LeaveDay, as: "leaveDays" },
		});
		return result;
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
				await leaveRequest.save();
				// create new leaveDays
				const newLeaveDayItems: LeaveDay[] = await Promise.all(
					leaveDays.map(async (item: any) => {
						const result = await leaveRequest.createLeaveDay(
							{ date: moment(item.date, "DD-MM-YYYY").toDate() },
							{
								transaction,
							},
						);
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
			await leaveRequest.save({ transaction });
			// save and commit the transaction
			await transaction.commit();

			// Reload the model to get the updated associations
			return leaveRequest;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async updateStatus(id: number, status: LeaveRequestStatus) {
		return await this._model.update({ status }, { where: { id } });
	}

	public async updateStatusByIds(
		ids: number[],
		status: string,
		transaction?: Transaction,
	) {
		// console.log(status, ids)
		return await this._model.update({ status }, { where: { id: ids }, transaction });
	}

	public async deleteLeaveRequest(id: number, data: number) {
		const transaction = await Loader.sequelize.transaction();
		try {
			const userId = data;
			const leaveRequest = await this._model.findOne({
				where: { id, userId },
				transaction,
			});
			if (!leaveRequest) {
				throw new RecordNotFoundError();
			}

			await leaveRequest.destroy();
			await transaction.commit();
			return true;
		} catch (err) {
			await transaction.rollback();
			return false;
		}
	}
}
