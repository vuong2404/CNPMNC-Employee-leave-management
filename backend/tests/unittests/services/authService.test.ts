import { AuthenticationService } from "../../../src/Services/AuthenticationService";
import { User } from "../../../src/Models";
import {
	BadRequestError,
	RecordNotFoundError,
	UnauthorizedError,
} from "../../../src/Errors";
import { IUserRepository, ITokenRepository } from "../../../src/Repositories";
import { TYPES } from "../../../src/Types/type";
import { container } from "../../../src/Configs";
import { TokenUtil } from "../../../src/Utils";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../src/Constants";
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";

const { verify } = jwt as jest.Mocked<typeof import("jsonwebtoken")>;

jest.mock("../../../src/Utils/Token");
jest.mock("jsonwebtoken");

describe("AuthenticationService", () => {
	let authService: AuthenticationService;
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockTokenRepository: jest.Mocked<ITokenRepository>;
	let mockResponse: any;
	let mockNext: jest.Mock;
	let verify: jest.Mock;

	beforeEach(() => {
		mockUserRepository = {
			findByUsername: jest.fn(),
			findById: jest.fn(),
			clearTokens: jest.fn(),
			findByEmail: jest.fn(),
			findOrCreate: jest.fn(),
			all: jest.fn(),
			create: jest.fn(),
			delete: jest.fn(),
			getLeaveRequest: jest.fn(),
			getLeaveRequests: jest.fn(),
			update: jest.fn(),
			removeToken: jest.fn(),
		} as jest.Mocked<IUserRepository>;

		mockTokenRepository = {
			removeToken: jest.fn(),
			all: jest.fn(),
			clearTokens: jest.fn(),
			create: jest.fn(),
			delete: jest.fn(),
			findById: jest.fn(),
			update: jest.fn(),
		} as jest.Mocked<ITokenRepository>;

		container.unbind(TYPES.IUserRepository);
		container.unbind(TYPES.ITokenRepository);

		container
			.bind<IUserRepository>(TYPES.IUserRepository)
			.toConstantValue(mockUserRepository);
		container
			.bind<ITokenRepository>(TYPES.ITokenRepository)
			.toConstantValue(mockTokenRepository);

		authService = new AuthenticationService();
		mockResponse = {
			send: jest.fn(),
			cookie: jest.fn(),
			status: jest.fn().mockReturnThis(),
			set: jest.fn(),
		};
		mockNext = jest.fn();

		// mock jwt.verify
		verify = jest
			.fn()
			.mockImplementation((token: string, secret: string): JwtPayload => {
				return { id: 1 };
			});
	});

	describe("login", () => {
		it("should send tokens for valid credentials", async () => {
			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
				},
			};

			const mockUser = new User();
			mockUser.checkPassword = jest.fn().mockResolvedValue(true);
			mockUser.generateAccessToken = jest.fn().mockReturnValue("mockAccessToken");
			mockUser.generateRefreshToken = jest
				.fn()
				.mockResolvedValue("mockRefreshToken");

			mockUserRepository.findByUsername.mockResolvedValue(mockUser);

			await authService.login(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("testuser");
			expect(mockUser.checkPassword).toHaveBeenCalledWith("testpassword");
			expect(mockUser.generateAccessToken).toHaveBeenCalled();
			expect(mockUser.generateRefreshToken).toHaveBeenCalled();
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				message: undefined,
				accessToken: "mockAccessToken",
				user: { id: null },
			});
		});

		it("should handle errors for invalid credentials", async () => {
			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
				},
			};

			const mockUser = new User();
			mockUser.checkPassword = jest.fn().mockResolvedValue(false);
			mockUserRepository.findByUsername.mockResolvedValue(mockUser);

			await authService.login(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("testuser");
			expect(mockUser.checkPassword).toHaveBeenCalledWith("testpassword");
			expect(mockNext).toHaveBeenCalledWith(
				new BadRequestError("Password is incorrect"),
			);
		});

		it("should handle RecordNotFoundError for non-existing user", async () => {
			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
				},
			};

			mockUserRepository.findByUsername.mockResolvedValue(null);

			await authService.login(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findByUsername).toHaveBeenCalledWith("testuser");
			expect(mockNext).toHaveBeenCalledWith(
				new RecordNotFoundError("User not exist"),
			);
		});
	});

	describe("logout", () => {
		it("should log out user and destroy refresh token", async () => {
			const mockRequest: any = {
				userId: "testUserId",
				cookies: {
					refreshToken: "testRefreshToken",
				},
			};

			await authService.logout(mockRequest, mockResponse, mockNext);

			expect(mockTokenRepository.removeToken).toHaveBeenCalledWith(
				TokenUtil.hash("testRefreshToken", process.env.SECRET_KEY as string),
				"testUserId",
			);
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				"refreshToken",
				"",
				Object.assign(REFRESH_TOKEN.cookie.options, {
					expires: new Date(1),
				}),
			);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				message: "Log out",
			});
		});
	});
	describe("logoutAllDevices", () => {
		it("should clear tokens, destroy refresh token cookie, and send success response", async () => {
			const mockRequest: any = {
				cookies: {
					[REFRESH_TOKEN.cookie.name]: "testRefreshToken",
				},
				userId: "testUserId",
			};

			await authService.logoutAllDevices(mockRequest, mockResponse, mockNext);

			expect(mockTokenRepository.clearTokens).toHaveBeenCalledWith("testUserId");
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				REFRESH_TOKEN.cookie.name,
				"",
				expect.objectContaining({
					expires: new Date(1),
				}),
			);
			expect(mockResponse.status).toHaveBeenCalledWith(205);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
			});
			expect(mockNext).not.toHaveBeenCalled(); // Ensure that the 'next' function is not called on success
		});

		it("should handle UnauthorizedError when not logged in", async () => {
			const mockRequest: any = {
				cookies: {}, // No refresh token cookie
				userId: "testUserId",
			};

			await authService.logoutAllDevices(mockRequest, mockResponse, mockNext);

			expect(mockTokenRepository.clearTokens).not.toHaveBeenCalled();
			expect(mockResponse.cookie).not.toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.send).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError)); // Ensure that the 'next' function is called with UnauthorizedError
		});
	});

	describe("refreshToken", () => {
		it("should refresh access token and send it in the response", async () => {
			const mockRequest: any = {
				cookies: {
					refreshToken: "testRefreshToken",
				},
				header: jest.fn().mockReturnValue("Bearer testAccessToken"),
			};

			// Mock the decoded values for jwt.verify

			const verify = jest.spyOn(jwt, "verify");
			verify.mockImplementation(() => ({ id: 1 }));
			const mockUser = new User();
			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockUser.generateAccessToken = jest.fn().mockReturnValue("newAccessToken");
			try {
				await authService.refreshToken(mockRequest, mockResponse, mockNext);
			} catch (error) {
				console.log(error);
			}

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.set).toHaveBeenCalledWith({
				"Cache-Control": "no-store",
				Pragma: "no-cache",
			});
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				accessToken: "newAccessToken",
			});
			expect(mockNext).not.toHaveBeenCalled(); // Ensure that the 'next' function is not called on success
		});

		// Add more test cases for different scenarios, such as missing refresh token, invalid access token, etc.

		it("should handle UnauthorizedError when not logged in", async () => {
			const mockRequest: any = {
				cookies: {}, // No refresh token cookie
				header: jest.fn().mockReturnValue("Bearer testAccessToken"),
			};

			await authService.refreshToken(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.set).not.toHaveBeenCalled();
			expect(mockResponse.send).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError)); // Ensure that the 'next' function is called with UnauthorizedError
		});

		it('should handle missing "Bearer " prefix in access token', async () => {
			const mockRequest: any = {
				cookies: {
					[REFRESH_TOKEN.cookie.name]: "testRefreshToken",
				},
				header: jest.fn().mockReturnValue("testAccessToken"), // Missing "Bearer " prefix
			};

			await authService.refreshToken(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
		});

		it("should handle TokenExpiredError during token verification", async () => {
			const mockRequest: any = {
				cookies: {
					[REFRESH_TOKEN.cookie.name]: "testRefreshToken",
				},
				header: jest.fn().mockReturnValue("Bearer testAccessToken"),
			};

			const tokenExpiredError = new TokenExpiredError("Token expired", new Date());
			const verify = jest.spyOn(jwt, "verify");
			verify.mockImplementationOnce(() => {
				throw tokenExpiredError;
			});

			await authService.refreshToken(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(tokenExpiredError);
		});

		it("should handle JsonWebTokenError during token verification", async () => {
			const mockRequest: any = {
				cookies: {
					[REFRESH_TOKEN.cookie.name]: "testRefreshToken",
				},
				header: jest.fn().mockReturnValue("Bearer testAccessToken"),
			};

			const jsonWebTokenError = new JsonWebTokenError("Invalid token");
			const verify = jest.spyOn(jwt, "verify");
			verify.mockImplementationOnce(() => {
				throw jsonWebTokenError;
			});

			await authService.refreshToken(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(jsonWebTokenError);
		});
	});
});
