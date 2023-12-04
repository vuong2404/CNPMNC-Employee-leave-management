import { CookieOptions, NextFunction, Request, Response } from "express";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import { User } from "../Models";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../Constants";
import { validationResult } from "express-validator";

import {
	BadRequestError,
	RecordNotFoundError,
	UnauthorizedError,
	ValidationError,
} from "../Errors";
import { IUserRepository, ITokenRepository } from "../Repositories";
import { TokenUtil } from "../Utils";
import { injectable } from "inversify";

export interface IAuthenticationService {
	login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	logoutAllDevices: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	refreshToken: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
}
@injectable()
export class AuthenticationService implements IAuthenticationService {
	constructor(
		private userRepository = container.get<IUserRepository>(
			TYPES.IUserRepository
		),
		private tokenRepository = container.get<ITokenRepository>(
			TYPES.ITokenRepository
		)
	) { }

	public login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw new ValidationError(errors.array()[0].msg);
			}

			const { username, password } = req.body;
			const user = await this.userRepository.findByUsername(username);
			if (!user) {
				throw new RecordNotFoundError("User not exist");
			}

			const isCorrectPassword = await user.checkPassword(password);
			if (!isCorrectPassword) {
				throw new BadRequestError("Password is incorrect");
			}

			this.sendToken(res, user);
		} catch (error) {
			next(error);
		}
	};

	public logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId;

			const cookies = req.cookies;
			const refreshToken = cookies[REFRESH_TOKEN.cookie.name];

			const rTknHash = TokenUtil.hash(refreshToken, REFRESH_TOKEN.secret || "");
			const result = await this.tokenRepository.removeToken(rTknHash, userId);
			console.log(result);
			const expireCookieOptions = Object.assign(
				{},
				REFRESH_TOKEN.cookie.options,
				{
					expires: new Date(1),
				}
			);
			// Destroy refresh token cookie
			res.cookie(REFRESH_TOKEN.cookie.name, "", expireCookieOptions);

			res.send({
				success: true,
				message: "Log out",
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	};

	public logoutAllDevices = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const cookies = req.cookies;

			if (!cookies[REFRESH_TOKEN.cookie.name]) {
				throw new UnauthorizedError("You have not login yet!");
			}
			const userId = req.userId;
			await this.tokenRepository.clearTokens(userId);

			const expireCookieOptions = Object.assign(
				{},
				REFRESH_TOKEN.cookie.options,
				{
					expires: new Date(1),
				}
			);

			// Destroy refresh token cookie
			res.cookie(REFRESH_TOKEN.cookie.name, "", expireCookieOptions);
			res.status(205).send({
				success: true,
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	};

	public refreshToken = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const cookies = req.cookies;
			const authHeader = req.header("Authorization");

			if (!cookies[REFRESH_TOKEN.cookie.name]) {
				throw new UnauthorizedError("Authentication error! Please login");
			}
			if (!authHeader?.startsWith("Bearer ")) {
				throw new UnauthorizedError(
					"Authorization Error! Invalid Access Token."
				);
			}

			const accessTokenParts = authHeader.split(" ");
			const staleAccessTkn = accessTokenParts[1];
			if (!ACCESS_TOKEN.secret) {
				throw new Error("Can not found access token secket key");
			}
			const decodedExpiredAccessTkn = jwt.verify(
				staleAccessTkn,
				ACCESS_TOKEN.secret,
				{
					ignoreExpiration: true,
				}
			);

			const rfTkn = cookies[REFRESH_TOKEN.cookie.name];
			// @ts-ignore
			const decodedRefreshTkn =  jwt.verify(rfTkn, REFRESH_TOKEN.secret);
			console.log(decodedRefreshTkn);

			const userWithRefreshTkn = await this.userRepository.findById(
				// @ts-ignore
				decodedExpiredAccessTkn.id
			);
			if (!userWithRefreshTkn) {
				throw new UnauthorizedError(
					"Authentication Error. You are unauthenticated!"
				);
			}
			// // GENERATE NEW ACCESSTOKEN
			const accessToken = userWithRefreshTkn.generateAccessToken();

			// Send back new created accessToken
			res.status(201);
			res.set({ "Cache-Control": "no-store", Pragma: "no-cache" });
			res.send({
				success: true,
				accessToken,
			});
		} catch (error: any) {
			if (error instanceof TokenExpiredError || JsonWebTokenError) {
				next(new UnauthorizedError(error.message, error.stack));
			}
			next(error);
		}
	};

	private async sendToken(res: Response, user: User, message?: string) {
		const accessToken = user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();

		if (REFRESH_TOKEN.cookie && REFRESH_TOKEN.cookie.options) {
			res.cookie(
				REFRESH_TOKEN.cookie.name,
				refreshToken,
				REFRESH_TOKEN.cookie.options as CookieOptions
			);
		}

		res.send({
			success: true,
			message,
			accessToken,
			user: {
				id: user.id,
			},
		});
	}
}
