import { Request, Response } from "express";
import { container } from "../../../src/Configs";
import { ITokenRepository, IUserRepository } from "../../../src/Repositories";
import { AuthenticationService, UserService } from "../../../src/Services";
import { TYPES } from "../../../src/Types/type";
import {
	CustomError,
	ForbiddenError,
	RecordNotFoundError,
	ValidationError,
} from "../../../src/Errors";
import { User } from "../../../src/Models";
import { Result, validationResult } from "express-validator";
import { HttpStatusCode } from "../../../src/Constants";
const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe("UserService", () => {
	let userService: UserService;
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockRequest: any;
	let mockResponse: any;
	let mockNext: jest.Mock;

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

		container.unbind(TYPES.IUserRepository);

		container
			.bind<IUserRepository>(TYPES.IUserRepository)
			.toConstantValue(mockUserRepository);

		userService = new UserService();
		mockResponse = {
			send: jest.fn(),
			cookie: jest.fn(),
			status: jest.fn().mockReturnThis(),
			set: jest.fn(),
		};
		mockNext = jest.fn();
	});

	describe("getAll", () => {
		it("should return all users if authorized", async () => {
			const mockRequest: any = {
				action: "read:any",
			};

			const mockUsers = [new User(), new User(), new User()];
			mockUserRepository.all.mockResolvedValue(mockUsers);

			await userService.getAll(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.all).toHaveBeenCalled();
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				result: mockUsers,
			});
		});

		it("should throw ForbiddenError if not authorized", async () => {
			const mockRequest: any = {
				action: undefined,
			};

			await userService.getAll(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.all).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
		});

		it("should call next with an error if an exception occurs", async () => {
			const mockRequest: any = {
				action: "read:any",
			};
			mockUserRepository.all.mockRejectedValue(new Error("Database error"));

			await userService.getAll(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.all).toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe("getUserInfo", () => {
		it("should return user info if user exists", async () => {
			const mockRequest: any = {
				userId: 1,
			};
			const mockUser = new User();
			mockUserRepository.findById.mockResolvedValue(mockUser);

			await userService.getUserInfo(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				user: mockUser,
			});
		});

		it("should throw RecordNotFoundError if user does not exist", async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			const mockRequest: any = {
				userId: 1,
			};

			await userService.getUserInfo(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
		});

		it("should call next with an error if an exception occurs", async () => {
			mockUserRepository.findById.mockRejectedValue(new Error("Database error"));

			const mockRequest: any = {
				userId: 1,
			};

			await userService.getUserInfo(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe("getUserById", () => {
		it("should return user by ID if authorized", async () => {
			const mockUser = new User();
			mockUserRepository.findById.mockResolvedValue(mockUser);
			const mockRequest: any = {
				userId: 2,
				action: "read:any",
				params: {
					id: 1,
				},
			};

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				user: mockUser,
			});
		});

		it("should return user by own ID if authorized", async () => {
			const mockRequest: any = {
				userId: 2,
				action: "read:own",
				params: {
					id: 2,
				},
			};

			const mockUser = new User();
			mockUserRepository.findById.mockResolvedValue(mockUser);

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(2);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				user: mockUser,
			});
		});

		it("should throw ForbiddenError if not authorized", async () => {
			const mockRequest: any = { action: undefined };

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
		});

		it("should throw ForbiddenError if user tries to access another user's info", async () => {
			const mockRequest: any = { id: 1, action: "read:own", params: { id: 2 } };

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).not.toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
		});

		it("should throw RecordNotFoundError if user does not exist", async () => {
			mockUserRepository.findById.mockResolvedValue(null);
			const mockRequest: any = {
				action: "read:any",
				params: { id: 1 },
				userId: 2,
			};

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
		});

		it("should call next with an error if an exception occurs", async () => {
			mockUserRepository.findById.mockRejectedValue(new Error("Database error"));

			const mockRequest: any = {
				action: "read:any",
				params: { id: 1 },
				userId: 2,
			};

			await userService.getUserById(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe("createUser", () => {
		it("should create a new user if validation passes and user does not exist", async () => {
			const mockUser = new User();
			mockUserRepository.findOrCreate.mockResolvedValue([mockUser, true]);

			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
					firstname: "Test",
					lastname: "User",
					email: "test@example.com",
					gender: "male",
					birthday: "1990-01-01",
					phone: "1234567890",
				},
			};

			await userService.createUser(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findOrCreate).toHaveBeenCalledWith({
				username: "testuser",
				password: "testpassword",
				firstname: "Test",
				lastname: "User",
				email: "test@example.com",
				gender: "male",
				birthday: "1990-01-01",
				phone: "1234567890",
			});
			expect(mockResponse.send).toHaveBeenCalledWith({
				user: mockUser,
				success: true,
			});
		});

		// it("should throw CustomError with conflict status if user already exists", async () => {
		// 	mockUserRepository.findOrCreate.mockResolvedValue([new User(), false]);

		// 	const mockRequest: any = {
		// 		body: {
		// 			username: "testuser",
		// 			password: "testpassword",
		// 			firstname: "Test",
		// 			lastname: "User",
		// 		},
		// 	};

		// 	=
		// 	// expect(mockUserRepository.findOrCreate).toHaveBeenCalledWith(
		// 	// 	mockRequest.body,
		// 	// );
		// 	// expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
		// 	// expect(mockNext.mock.calls[0][0].statusCode).toBe(HttpStatusCode.Conflict);
		// });

		// it("should throw ValidationError if validation fails", async () => {
		// 	const validationError = new ValidationError("Validation error");
		// 	const validationResult = jest.fn();

		// 	validationResult.mockReturnValueOnce({
		// 		isEmpty: () => false,
		// 		array: () => [validationError],
		// 	});

		// 	const mockRequest: any = {
		// 		body: {
		// 			username: "testuser",
		// 			password: "testpassword",
		// 			firstname: "Test",
		// 			lastname: "User",
		// 		},
		// 	};

		// 	await userService.createUser(mockRequest, mockResponse, mockNext);

		// 	expect(validationResult).toHaveBeenCalledWith(mockRequest);
		// 	expect(mockUserRepository.findOrCreate).not.toHaveBeenCalled();
		// 	expect(mockNext).toHaveBeenCalledWith(validationError);
		// });

		it("should call next with an error if an exception occurs", async () => {
			const databaseError = new Error("Database error");
			mockUserRepository.findOrCreate.mockRejectedValue(databaseError);

			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
					firstname: "Test",
					lastname: "User",
				},
			};

			await userService.createUser(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.findOrCreate).toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(databaseError);
		});
	});

	describe("editUserInfo", () => {
		it("should edit user info if validation passes and user exists", async () => {
			const mockUser = new User();
			mockUserRepository.update.mockResolvedValue(mockUser);

			const mockRequest: any = {
				body: {
					firstname: "UpdatedFirstName",
					lastname: "UpdatedLastName",
					email: "updated@example.com",
					gender: "female",
					birthday: "1995-01-01",
					phone: "9876543210",
				},
				action: "update:any",
				params: { id: 1 },
				userId: 1,
			};

			await userService.editUserInfo(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.update).toHaveBeenCalledWith(1, mockRequest.body);
			expect(mockResponse.send).toHaveBeenCalledWith({
				success: true,
				result: mockUser,
			});
		});

		// it("should throw CustomError with conflict status if user already exists", async () => {
		// 	mockUserRepository.update.mockResolvedValue();

		// 	mockRequest.body = {
		// 		// Updated user data
		// 	};
		// 	mockRequest.action = "update:any";
		// 	mockRequest.params = { id: 1 };
		// 	mockRequest.userId = 1;

		// 	await userService.editUserInfo(mockRequest, mockResponse, mockNext);

		// 	expect(validationResult).toHaveBeenCalledWith(mockRequest);
		// 	expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
		// 		// Updated user data
		// 	});
		// 	expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
		// 	expect(mockNext.mock.calls[0][0].statusCode).toBe(HttpStatusCode.Conflict);
		// });

		// it("should throw ValidationError if validation fails", async () => {
			

		// 	const mockRequest: any = {
		// 		body: {
		// 			username: "testuser",
		// 			password: "testpassword",
		// 			firstname: "Test",
		// 			lastname: "User",
		// 		},
		// 		action: "update:any",
		// 		params: { id: 1 },
		// 		userId: 1,
		// 	};

		// 	await userService.editUserInfo(mockRequest, mockResponse, mockNext);

		// 	expect(mockUserRepository.update).not.toHaveBeenCalled();
		// 	expect(mockNext).toHaveBeenCalledWith(validationError);
		// });

		// it("should throw ForbiddenError if unauthorized user tries to edit another user's info", async () => {
		// 	const mockRequest: any = {
		// 		body: {
		// 			username: "testuser",
		// 			password: "testpassword",
		// 			firstname: "Test",
		// 			lastname: "User",
		// 		},
		// 		action: "update:own",
		// 		params: { id: 2 },
		// 		userId: 1,
		// 	};

		// 	await userService.editUserInfo(mockRequest, mockResponse, mockNext);

		// 	expect(mockUserRepository.update).not.toHaveBeenCalled();
		// 	expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
		// });

		it("should call next with an error if an exception occurs", async () => {
			const databaseError = new Error("Database error");
			mockUserRepository.update.mockRejectedValue(databaseError);

			const mockRequest: any = {
				body: {
					username: "testuser",
					password: "testpassword",
					firstname: "Test",
					lastname: "User",
				},
				action: "update:any",
				params: { id: 1 },
				userId: 1,
			};

			await userService.editUserInfo(mockRequest, mockResponse, mockNext);

			expect(mockUserRepository.update).toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(databaseError);
		});
	});
});
