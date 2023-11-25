import { CookieOptions, NextFunction, Request, Response } from "express";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import { ErrorName, HttpStatusCode } from "../Constants";
import { validationResult } from "express-validator";
import { IUserRepository } from "../Repositories";
import {
	CustomError,
	ForbiddenError,
	RecordNotFoundError,
	ValidationError,
} from "../Errors";
import { injectable } from "inversify";
import "reflect-metadata";

export interface IUserService {
	getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	editUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class UserService implements IUserService {
	constructor(
		private userRepository = container.get<IUserRepository>(TYPES.IUserRepository),
	) {}

	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (req.action === "read:any") {
				const result = await this.userRepository.all();
				res.send({
					success: true,
					result,
				});
			} else {
				throw new ForbiddenError("CANNOT access")
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await this.userRepository.findById(req.userId);
			if (user) {
				res.send({ success: true, user });
			} else {
				throw new RecordNotFoundError("User NOT FOUND");
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public getUserById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}
			let user = null;
			if (req.action === "read:any") {
				user = await this.userRepository.findById(Number(req.params["id"]));
			} else if (req.action === "read:own") {
				if (Number(req.params["id"]) != req.userId) {
					throw new ForbiddenError("CANNOT Access");
				}
				user = await this.userRepository.findById(Number(req.userId));
			} else {
				throw new ForbiddenError("CANNOT Access");
			}

			if (user) {
				res.send({ success: true, user });
			} else {
				throw new RecordNotFoundError("User NOT FOUND");
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	};

	public createUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}
			const {
				username,
				password,
				firstname,
				lastname,
				email,
				gender,
				birthday,
				phone,
			} = req.body;
			const data = {
				username,
				password,
				firstname,
				lastname,
				email,
				gender,
				birthday,
				phone,
			};
			let [user, created] = await this.userRepository.findOrCreate(data);
			if (created) {
				res.send({ user, created });
			} else {
				throw new CustomError(
					HttpStatusCode.Conflict,
					ErrorName.CONFLICT,
					"User was exists",
				);
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public editUserInfo = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}
			const { firstname, lastname, email, gender, birthday, phone } = req.body;
			const data = {
				firstname,
				lastname,
				email,
				gender,
				birthday,
				phone,
			};
			let userId =
				req.action === "update:any" ? Number(req.params["id"]) : req.userId;

			let result = await this.userRepository.update(userId, data);
			if (result) {
				res.send({ success: true, result });
			} else {
				throw new CustomError(
					HttpStatusCode.Conflict,
					ErrorName.CONFLICT,
					"User was exists",
				);
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			
		} catch (error) {}
	};
}
