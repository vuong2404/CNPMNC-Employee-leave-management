import { CookieOptions, NextFunction, Request, Response } from "express";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import {
	ErrorName,
	HttpStatusCode,
} from "../Constants";
import { validationResult } from "express-validator";
import { IUserRepository } from "../Repositories";
import { CustomError, ValidationError } from "../Errors";
import { injectable } from "inversify";
import "reflect-metadata"

export interface IUserService {
	getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	editUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class UserService implements IUserService {
	constructor(
		private userRepository = container.get<IUserRepository>(
			TYPES.IUserRepository,
		),
	) {}

	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.userRepository.all();
			res.send({
				success: true,
				result,
			});
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public createUser = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}
			let [user, created] = await this.userRepository.findOrCreate(
				req.body,
			);
			if (created) {
				res.send({ user, created });
			}
			throw new CustomError(
				HttpStatusCode.Conflict,
				ErrorName.CONFLICT,
				"User was exists",
			);
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public editUserInfo = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
		} catch (error) {}
	};

	public deleteUser = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
		} catch (error) {}
	};
}
