import { NextFunction, Request, Response } from "express";
import { IUserService, UserService } from "../Services";
import { injectable } from "inversify";
import { container } from "../Configs";
import { TYPES } from "../Types/type";

export interface IUserController {
	getAllUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	editUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;

}

@injectable()
export class UserController implements IUserController {
	private userservice = container.get<IUserService>(TYPES.IUserService)

	public createUser = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.createUser(req, res, next);
	};

	public getUserById = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.getUserById(req, res, next);
	};

	public getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.getUserInfo(req, res, next);
	};

	public getAllUser = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.getAll(req, res, next);
	};

	public editUserInfo = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.editUserInfo(req, res, next);
	};

	public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
		await this.userservice.deleteUser(req, res, next);
	};
}
