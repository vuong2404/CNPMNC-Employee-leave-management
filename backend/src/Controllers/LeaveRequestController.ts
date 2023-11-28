import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import { ILeaveRequestService } from "../Services/LeaveRequestService";

export interface ILeaveRequestController {
	getAll: (req: Request, res: Response, next: NextFunction) => void;
	getById: (req: Request, res: Response, next: NextFunction) => void;
	create: (req: Request, res: Response, next: NextFunction) => void;
	update: (req: Request, res: Response, next: NextFunction) => void;
	approve: (req: Request, res: Response, next: NextFunction) => void;
	reject: (req: Request, res: Response, next: NextFunction) => void;
	cancel: (req: Request, res: Response, next: NextFunction) => void;
	search: (req: Request, res: Response, next: NextFunction) => void;
}

@injectable()
export class LeaveRequestController implements ILeaveRequestController {
	private leaveRequestService = container.get<ILeaveRequestService>(
		TYPES.ILeaveRequestService,
	);
	public getAll = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.getAll(req, res, next);
	};

	public getById = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.getById(req, res, next);
	};
	public create = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.create(req, res, next);
	};
	public update = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.update(req, res, next);
	};
	public approve = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.approve(req, res, next);
	};
	public reject = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.reject(req, res, next);
	};
	public cancel = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.cancel(req, res, next);
	};
	public search = (req: Request, res: Response, next: NextFunction) => {
		this.leaveRequestService.getById(req, res, next);
	};
}
