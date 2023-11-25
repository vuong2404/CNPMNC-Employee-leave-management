import { injectable } from "inversify";
import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { container } from "../Configs";
import { ILeaveRequestRepository } from "../Repositories/ILeaveRequestRepository";
import { TYPES } from "../Types/type";
import {
	BadRequestError,
	ForbiddenError,
	RecordNotFoundError,
	ValidationError,
} from "../Errors";
import { IUserRepository } from "../Repositories";
import { validationResult } from "express-validator";
import { LeaveRequestStatus } from "../Constants";
import Loader from "../Loaders";

export interface ILeaveRequestService {
	getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	approve: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	reject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	cancel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	search: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class LeaveRequestService implements ILeaveRequestService {
	private leaveRequestRepository = container.get<ILeaveRequestRepository>(
		TYPES.ILeaveRequestRepository,
	);
	private userRequestRepository = container.get<IUserRepository>(TYPES.IUserRepository);
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (req.action === "read:any") {
				res.send({
					success: true,
					result: await this.leaveRequestRepository.all(),
				});
			} else if (req.action === "read:own") {
				const user = await this.userRequestRepository.getLeaveRequests(
					req.userId,
				);
				res.send({ success: true, result: user });
			} else {
				throw new ForbiddenError();
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (req.action === "read:any") {
				res.send({
					sucsess: true,
					result: await this.leaveRequestRepository.findById(
						Number(req.params["id"]),
					),
				});
			} else if (req.action === "read:own") {
				const result = await this.userRequestRepository.getLeaveRequest(
					req.userId,
					req.params["id"],
				);

				if (!result) {
					throw new RecordNotFoundError("CANNOT found this leave request");
				}

				res.send({
					success: true,
					result,
				});
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}

			const { title, reason, description, leaveDays } = req.body;

			const result = await this.leaveRequestRepository.create({
				userId: req.userId,
				title,
				reason,
				description,
				leaveDays,
			});

			res.send({ success: true, result });
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}

			const { title, reason, description, leaveDays } = req.body;

			if (req.action === "update:own") {
				const result = await this.leaveRequestRepository.update(
					Number(req.params["id"]),
					{
						userId: req.userId,
						title,
						reason,
						description,
						leaveDays,
					},
				);

				res.send({ success: true, result });
			} else {
				throw new ForbiddenError();
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public approve = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params["id"]);
			if (req.action === "update:any") {
				const leaveRequest = await this.leaveRequestRepository.findById(id);
				if (!leaveRequest) {
					throw new RecordNotFoundError();
				}
				if (!(leaveRequest.status === LeaveRequestStatus.PENDING)) {
					throw new BadRequestError(
						`CANNOT APPROVE the leave request with status ${leaveRequest.status}`,
					);
				} else {
					const transaction = Loader.sequelize.transaction()
					console.log(leaveRequest.getLeaveDays())
					const result = await this.leaveRequestRepository.updateStatus(
						id,
						LeaveRequestStatus.APPROVED,
					);
					res.send({ success: true });
				}
			} else {
				throw new ForbiddenError();
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public reject = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params["id"]);
			if (req.action === "update:any") {
				const leaveRequest = await this.leaveRequestRepository.findById(id);
				if (!leaveRequest) {
					throw new RecordNotFoundError();
				}
				if (!(leaveRequest.status === LeaveRequestStatus.PENDING)) {
					throw new BadRequestError(
						`CANNOT REJECT the leave request with status ${leaveRequest.status}`,
					);
				} else {
					const result = await this.leaveRequestRepository.updateStatus(
						id,
						LeaveRequestStatus.REJECTED,
					);
					res.send({ success: true });
				}
			} else {
				throw new ForbiddenError();
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
	public cancel = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params["id"]);
			if (req.action === "update:own") {
				const leaveRequest = await this.leaveRequestRepository.findById(id);
				if (!leaveRequest) {
					throw new RecordNotFoundError();
				}
				if (!(leaveRequest.status === LeaveRequestStatus.PENDING)) {
					throw new BadRequestError(
						`CANNOT UPDATE the leave request with status ${leaveRequest.status}`,
					);
				} else {
					const result = await this.leaveRequestRepository.updateStatus(
						id,
						LeaveRequestStatus.CANCELED,
					);
					res.send({ success: true, result });
				}
			} else {
				throw new ForbiddenError();
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};
	public search = async (req: Request, res: Response, next: NextFunction) => {};
}
