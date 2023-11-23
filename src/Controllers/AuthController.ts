import { NextFunction, Request, Response } from "express";
import { IAuthenticationService } from "../Services";
import { injectable } from "inversify";
import { container } from "../Configs";
import { TYPES } from "../Types/type";

export interface IAuthController {
	login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	logoutAllDevices: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class AuthController implements IAuthController {
	constructor(
		private authService = container.get<IAuthenticationService>(
			TYPES.IAuthenticationService,
		),
	) {}

	public login = async (req: Request, res: Response, next: NextFunction) => {
		await this.authService.login(req, res, next);
	};

	public logout = async (req: Request, res: Response, next: NextFunction) => {
		await this.authService.logout(req, res, next);
	};

	public logoutAllDevices = async (req: Request, res: Response, next: NextFunction) => {
		await this.authService.logoutAllDevices(req, res, next);
	};

	public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
		await this.authService.refreshToken(req, res, next);
	};
}
