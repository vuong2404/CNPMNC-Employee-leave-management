import { injectable } from "inversify";
import "reflect-metadata";
import { BaseRepository } from "./BaseRepository";
import { User, Token, LeaveDay, LeaveRequest, ApprovedDay } from "../../Models";
import { IUserRepository, UserDTO } from "../IUserRepository";
import { RecordNotFoundError } from "../../Errors";

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
	constructor() {
		super(User);
	}

	public async all(): Promise<User[]> {
		return await this._model.findAll({include: {model: LeaveDay, as: "approvedDays"}});
	}

	public async findById(id: number, attributes?: string[]) {
		return this._model.findByPk(id, {include: {model: LeaveDay, as: "approvedDays"}})
	}

	public async findByEmail(email: string): Promise<User | null> {
		return await this._model.findOne({ where: { email: email } });
	}

	public async removeToken(token: string, user: User): Promise<User> {
		let tokens = await user.getTokens();
		tokens = tokens.filter((tokenObj: Token) => tokenObj.value !== token);

		return await user.save();
	}

	public async findByUsername(username: string) {
		return await this._model.findOne({ where: { username } });
	}

	public async findOrCreate(data: UserDTO) {
		const { username, password, ...otherAttributes } = data;
		return await this._model.findOrCreate({
			where: { username: username },
			defaults: { ...otherAttributes, hashedPassword: password }
		});
	}

	public async getLeaveRequests(userId: number) {
		const user = await this.findById(userId);
		if (!user) {
			throw new RecordNotFoundError();
		}

		let result = await user.getLeaveRequests({ include: { model: LeaveDay, as: "leaveDays" } });

		return result;
	}

	public async getLeaveRequest(userId: number, leaveRequestId: number | string) {
		const user = await this.findById(userId);
		if (!user) {
			throw new RecordNotFoundError("User NOT FOUND");
		}
		const result = await user.getLeaveRequests({
			include: { model: LeaveDay, as: "leaveDays" },
			where: { id: leaveRequestId },
		});
		if (result.length == 0) {
			return null ;
		}
        return result[0];
	}
}
