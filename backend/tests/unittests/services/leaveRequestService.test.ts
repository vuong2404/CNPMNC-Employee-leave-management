import { Request, Response } from "express";
import { container } from "../../../src/Configs";
import {
  ILeaveRequestRepository,
  ITokenRepository,
  IUserRepository,
} from "../../../src/Repositories";
import { AuthenticationService, UserService } from "../../../src/Services";
import { TYPES } from "../../../src/Types/type";
import {
  CustomError,
  ForbiddenError,
  RecordNotFoundError,
  ValidationError,
  BadRequestError,
} from "../../../src/Errors";
import { LeaveDay, LeaveRequest, User } from "../../../src/Models";
import { Result, validationResult } from "express-validator";
import { HttpStatusCode } from "../../../src/Constants";
import {
  ILeaveRequestService,
  LeaveRequestService,
} from "../../../src/Services/LeaveRequestService";
const mockedValidationResult = validationResult as jest.MockedFunction<
  typeof validationResult
>;
import {
  LeaveRequestStatus,
  DEFAULT_LEAVE_DAYS,
} from "../../../src/Constants/common";

const parseLeaveDay = (leaveRequests: LeaveRequest[]) => {
  const result = leaveRequests.map((leaveRequest: any) => {
    const leaveRequestJSON = leaveRequest.toJSON();
    const mappedLeaveDays = leaveRequestJSON.leaveDays
      ? leaveRequestJSON.leaveDays.map((leaveDay: any) => leaveDay.date)
      : [];

    return {
      ...leaveRequestJSON,
      leaveDays: mappedLeaveDays,
    };
  });

  return result;
};

describe("leaveRequestService", () => {
  let userService: UserService;
  let leaveRequestService: LeaveRequestService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockLeaveRequestRepository: jest.Mocked<ILeaveRequestRepository>;
  let mockLeaveRequest: jest.Mocked<LeaveRequest>;
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

    mockLeaveRequestRepository = {
      all: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      deleteLeaveRequest: jest.fn(),
      setLeaveDays: jest.fn(),
      getLeaveDays: jest.fn(),
      removeLeaveDays: jest.fn(),
      createLeaveDay: jest.fn(),
      addLeaveDays: jest.fn(),
      addLeaveDay: jest.fn(),
      getUser: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ILeaveRequestRepository>;

    const mockLeaveRequest: LeaveRequest = {
      getUser: jest.fn(),
      setLeaveDays: jest.fn(),
      getLeaveDays: jest.fn(),
      removeLeaveDays: jest.fn(),
      createLeaveDay: jest.fn(),
      addLeaveDays: jest.fn(),
      addLeaveDay: jest.fn(),
    } as unknown as jest.Mocked<LeaveRequest>;

    container.unbind(TYPES.IUserRepository);
    container.unbind(TYPES.ILeaveRequestRepository);
    container
      .bind<IUserRepository>(TYPES.IUserRepository)
      .toConstantValue(mockUserRepository);
    container
      .bind<ILeaveRequestRepository>(TYPES.ILeaveRequestRepository)
      .toConstantValue(mockLeaveRequestRepository);

    userService = new UserService();
    leaveRequestService = new LeaveRequestService();
    mockResponse = {
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      set: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("getAll", () => {
    it("should return all leave request", async () => {
      const mockRequest: any = {
        action: "read:any",
      };
      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
        new LeaveRequest({
          title: "Leave request 2",
          reason: "Reason 2",
          description: "Description 2",
          status: "pending",
          userId: 2,
          leaveDays: ["12-23-2023", "2-27-2024"],
        }),
      ];

      mockLeaveRequestRepository.all.mockResolvedValue(mockLeaves);
      await leaveRequestService.getAll(mockRequest, mockResponse, mockNext);

      expect(mockLeaveRequestRepository.all).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves),
        success: true,
      });
    });

    it("should throw ForbiddenError if not undefined action", async () => {
      const mockRequest: any = {
        action: undefined,
      };

      await leaveRequestService.getAll(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.all).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it("should return all request of a employee", async () => {
      const mockRequest: any = {
        action: "read:own",
        userId: 1,
      };

      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          status: LeaveRequestStatus.PENDING,
          title: "Title 1",
          reason: "Reason 1",
          id: 1,
        }),
        new LeaveRequest({
          status: LeaveRequestStatus.PENDING,
          title: "Title 2",
          reason: "Reason 2",
          id: 2,
        }),
        new LeaveRequest({
          status: LeaveRequestStatus.PENDING,
          title: "Title 3",
          reason: "Reason 3",
          id: 3,
        }),
      ];

      mockUserRepository.getLeaveRequests.mockResolvedValue(mockLeaves);
      await leaveRequestService.getAll(mockRequest, mockResponse, mockNext);

      expect(mockUserRepository.getLeaveRequests).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves),
        success: true,
      });
    });
  });

  describe("getById", () => {
    it("should return all leave request", async () => {
      const mockRequest: any = {
        action: "read:any",
        params: {
          id: "1",
        },
      };
      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
      ];

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves[0]);
      await leaveRequestService.getById(mockRequest, mockResponse, mockNext);

      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves)[0],
        success: true,
      });
    });

    it("should throw RecordNotFoundError if not find request", async () => {
      const mockRequest: any = {
        action: "read:any",
        params: {
          id: "99",
        },
      };

      mockLeaveRequestRepository.findById.mockResolvedValue(null);
      await leaveRequestService.getById(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
    });

    it("should return request of a employee", async () => {
      const mockRequest: any = {
        action: "read:own",
        userId: "1",
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
      ];

      mockUserRepository.getLeaveRequest.mockResolvedValue(mockLeaves[0]);
      await leaveRequestService.getById(mockRequest, mockResponse, mockNext);
      expect(mockUserRepository.getLeaveRequest).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves)[0],
        success: true,
      });
    });

    it("should throw RecordNotFoundError if not find request of a employee", async () => {
      const mockRequest: any = {
        action: "read:own",
        userId: "1",
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
      ];

      mockUserRepository.getLeaveRequest.mockResolvedValue(null);
      await leaveRequestService.getById(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
    });
  });

  describe("create", () => {
    it("should create leave request if validation passes and leave request does not exist", async () => {
      const mockRequest: any = {
        body: {
          title: "Title 1",
          reason: "Reson 1",
          description: "Description 1",
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        },
      };

      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
      ];

      mockLeaveRequestRepository.create.mockResolvedValueOnce(mockLeaves[0]);
      await leaveRequestService.create(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.create).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves)[0],
        success: true,
      });
    });
  });

  describe("update", () => {
    it("should update leave request if validation passes", async () => {
      const mockRequest: any = {
        action: "update:own",
        params: {
          id: "1",
        },
        body: {
          title: "Title 1",
          reason: "Reson 1",
          description: "Description 1",
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        },
      };

      const mockLeaves: LeaveRequest[] = [
        new LeaveRequest({
          title: "Leave request 1",
          reason: "Reason 1",
          description: "Description 1",
          status: "pending",
          userId: 1,
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        }),
      ];

      mockLeaveRequestRepository.update.mockResolvedValueOnce(mockLeaves[0]);
      await leaveRequestService.update(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.update).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        result: parseLeaveDay(mockLeaves)[0],
        success: true,
      });
    });

    it("should throw ForbiddenError if not valid action", async () => {
      const mockRequest: any = {
        action: undefined,
        params: {
          id: "99",
        },
        body: {
          title: "Title 1",
          reason: "Reson 1",
          description: "Description 1",
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        },
      };

      await leaveRequestService.update(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe("approve", () => {
    it("should throw ForbiddenError if action request invalid", async () => {
      const mockRequest: any = {
        action: undefined,
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        mockLeaveRequestRepository.updateStatus.mockResolvedValue({
          id: 1,
          status: LeaveRequestStatus.REJECTED,
        }),
        await leaveRequestService.approve(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
    it("should throw RecordNotFoundError if not find request leave", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(null),
        await leaveRequestService.approve(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
    });
    it("should throw BadRequestError if leave request is not PENDING", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: LeaveRequestStatus.APPROVED,
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        await leaveRequestService.approve(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
    it("should approve request", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockUser = {
        addApprovedDays: jest.fn(),
        countApprovedDays: jest.fn().mockResolvedValue(5),
        update: jest.fn(),
      };
      const mockLeaveRequest = {
        id: 1,
        status: LeaveRequestStatus.PENDING,
        getLeaveDays: jest.fn().mockResolvedValue([]),
        getUser: jest.fn().mockResolvedValue(mockUser),
      };
      mockLeaveRequestRepository.findById = jest
        .fn()
        .mockResolvedValue(mockLeaveRequest);
      mockLeaveRequestRepository.updateStatus = jest
        .fn()
        .mockResolvedValue(mockLeaveRequest);

      await leaveRequestService.approve(mockRequest, mockResponse, mockNext);

      expect(mockLeaveRequestRepository.findById).toHaveBeenCalledWith(1);
      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalled();
      expect(mockLeaveRequest.getLeaveDays).toHaveBeenCalled();
      expect(mockLeaveRequest.getUser).toHaveBeenCalled();
      //   expect(mockLeaveRequest.getUser().countApprovedDays).toHaveBeenCalled();
      const userFromGetUser = await mockLeaveRequest.getUser();
      expect(userFromGetUser.countApprovedDays).toHaveBeenCalled();
      expect(userFromGetUser.addApprovedDays).toHaveBeenCalled();
      expect(userFromGetUser.update).toHaveBeenCalled();

      const remainingLeaveDaysAfterUpdate = DEFAULT_LEAVE_DAYS - 5; // Update logic dependent
      expect(userFromGetUser.update).toHaveBeenCalledWith(
        { remainingLeaveDays: remainingLeaveDaysAfterUpdate },
        expect.any(Object)
      );

      const mockLeaveDays = await mockLeaveRequest.getLeaveDays();
      expect(userFromGetUser.addApprovedDays).toHaveBeenCalledWith(
        mockLeaveDays,
        expect.any(Object)
      );
    });
    it("should throw BadRequestErrort if number leavesday > DEFAULT (12)", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockUser = {
        addApprovedDays: jest.fn(),
        countApprovedDays: jest.fn().mockResolvedValue(15),
        update: jest.fn(),
      };
      const mockLeaveRequest = {
        id: 1,
        status: LeaveRequestStatus.PENDING,
        getLeaveDays: jest.fn().mockResolvedValue([]),
        getUser: jest.fn().mockResolvedValue(mockUser),
      };
      mockLeaveRequestRepository.findById = jest
        .fn()
        .mockResolvedValue(mockLeaveRequest);
      mockLeaveRequestRepository.updateStatus = jest
        .fn()
        .mockResolvedValue(mockLeaveRequest);

      await leaveRequestService.approve(mockRequest, mockResponse, mockNext);

      expect(mockLeaveRequestRepository.findById).toHaveBeenCalledWith(1);
      // expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalled();
      expect(mockLeaveRequest.getLeaveDays).toHaveBeenCalled();
      expect(mockLeaveRequest.getUser).toHaveBeenCalled();
      //   expect(mockLeaveRequest.getUser().countApprovedDays).toHaveBeenCalled();
      const userFromGetUser = await mockLeaveRequest.getUser();
      expect(userFromGetUser.countApprovedDays).toHaveBeenCalled();
      expect(userFromGetUser.addApprovedDays).toHaveBeenCalled();
      expect(userFromGetUser.update).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe("reject", () => {
    it("should reject leave request", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        mockLeaveRequestRepository.updateStatus.mockResolvedValue({
          id: 1,
          status: LeaveRequestStatus.REJECTED,
        }),
        await leaveRequestService.reject(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
      });
    });
    it("should throw RecordNotFoundError if not valid leave request", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(null),
        await leaveRequestService.reject(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
    });
    it("should throw BadRequestError if leave request is not PENDING", async () => {
      const mockRequest: any = {
        action: "update:any",
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: LeaveRequestStatus.APPROVED,
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        await leaveRequestService.reject(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
    it("should throw ForbiddenError if request action not valid", async () => {
      const mockRequest: any = {
        action: undefined,
        params: {
          id: "1",
        },
      };
      const mockLeaveDays: LeaveDay[] = [
        new LeaveDay({ date: "12-23-2023" }),
        new LeaveDay({ date: "2-27-2024" }),
      ];
      const mockUser = new User({
        id: 1,
        username: "testuser",
        password: "testpassword",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        gender: "male",
        birthday: "1990-01-01",
        phone: "1234567890",
        remainingLeaveDays: 10,
      });
      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: LeaveRequestStatus.PENDING,
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
        getLeaveDays: jest.fn().mockReturnValue(mockLeaveDays),
        getUser: jest.fn().mockResolvedValue(mockUser),
      });

      await leaveRequestService.reject(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe("cancel", () => {
    it("should cancel leave request", async () => {
      const mockRequest: any = {
        action: "update:own",
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        mockLeaveRequestRepository.updateStatus.mockResolvedValue({
          id: 1,
          status: LeaveRequestStatus.CANCELED,
        }),
        await leaveRequestService.cancel(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        result: {
          id: 1,
          status: LeaveRequestStatus.CANCELED,
        },
      });
    });
    it("should throw RecordNotFoundError if not valid leave request", async () => {
      const mockRequest: any = {
        body: {
          title: "Title 1",
          reason: "Reson 1",
          description: "Description 1",
          leaveDays: [
            "12-23-2023",
            "2-27-2024",
            "2-26-2024",
            "2-25-2024",
            "2-23-2024",
            "2-24-2024",
          ],
        },
        action: "update:own",
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: "pending",
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(null),
        await leaveRequestService.cancel(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();

      expect(mockNext).toHaveBeenCalledWith(expect.any(RecordNotFoundError));
    });
    it("should throw BadRequestError if leave request is not PENDING", async () => {
      const mockRequest: any = {
        action: "update:own",
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: LeaveRequestStatus.APPROVED,
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
      });

      mockLeaveRequestRepository.findById.mockResolvedValue(mockLeaves),
        await leaveRequestService.cancel(mockRequest, mockResponse, mockNext);
      expect(mockLeaveRequestRepository.findById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it("should throw ForbiddenError if request action not valid", async () => {
      const mockRequest: any = {
        action: undefined,
        params: {
          id: "1",
        },
      };

      const mockLeaves: LeaveRequest = new LeaveRequest({
        title: "Leave request 1",
        reason: "Reason 1",
        description: "Description 1",
        status: LeaveRequestStatus.PENDING,
        userId: 1,
        leaveDays: [
          "12-23-2023",
          "2-27-2024",
          "2-26-2024",
          "2-25-2024",
          "2-23-2024",
          "2-24-2024",
        ],
      });

      await leaveRequestService.cancel(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
