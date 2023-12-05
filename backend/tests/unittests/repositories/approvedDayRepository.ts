// import { Sequelize } from "sequelize";
// import {
//   PermissionRepository,
//   UserRepository,
//   LeaveRequestRepository,
// } from "../../../src/Repositories";
// import Tables, {
//   Permission,
//   User,
//   LeaveRequest,
//   ApprovedDay,
//   LeaveDay,
// } from "../../../src/Models";
// import { CreateUsersData } from "../../mockData/user";
// import { CreateLeaveRequest } from "../../mockData/leaveRequest";
// import { CreateApprovedDay } from "../../mockData/approvedDay";
// import Loader from "../../../src/Loaders";
// import { throws } from "assert";
// import { error } from "console";
// import { RecordNotFoundError } from "../../../src/Errors";
// import {
//   LeaveRequestStatus,
//   DEFAULT_LEAVE_DAYS,
// } from "../../../src/Constants/common";
// import { Request, Response, NextFunction } from "express";
// import { LeaveRequestService } from "../../../src/Services/LeaveRequestService";

// // jest.mock("../../../src/Repositories");
// // jest.mock("../../../src/Repositories/ILeaveRequestRepository.ts");
// // jest.mock("../../../src/Repositories/IUserRepository.ts");
// // jest.mock("../../../src/Services/LeaveRequestService");

// const mockRequest = () => {
//   return {
//     params: {
//       id: "1",
//     },
//     action: "update:any",
//   };
// };

// const mockResponse = () => {
//   return {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn().mockReturnThis(),
//     send: jest.fn().mockReturnThis(),
//   };
// };

// const mockUser = {
//   id: 1,
//   username: "user1",
//   hashedPassword: "123456",
//   firstname: "Nguyen van",
//   lastname: "A",
//   remainingDays: DEFAULT_LEAVE_DAYS,
// };
// describe("AprrovedDayRepository", () => {
//   let mockLeaveRequestRepository: LeaveRequestRepository;
//   // let LeaveRequestMock: LeaveRequest;
//   // let leaveRequestService: LeaveRequestService;
//   // let leaveRequestRepositoryMock: jest.Mocked<LeaveRequestRepository>;
//   // let mockUserRepository: UserRepository;
//   //   let mockleaveRequestService: LeaveRequestService;
//   beforeAll(async () => {
//     // Set up a test database connection
//     // const tables = new Tables();
//     // const loader = new Loader();
//     // await loader.load();
//     // await tables.createTables();
//     // await Loader.sequelize.sync({ force: true });

//     leaveRequestService = new LeaveRequestService();
//     // leaveRequestService['leaveRequestRepository'] = leaveRequestRepositoryMock;

//     // // LeaveRequestMock = new LeaveRequest();
//     // mockleaveRequestService = new LeaveRequestService();
//   });

//   afterEach(async () => {
//     // Close the database connection after all tests
//     // await Loader.sequelize.close();
//     await Loader.sequelize.sync({ force: true });
//   });

//   describe("LeaveRequestRepository", () => {
//     describe("aprrove", () => {
//       it("should approve a leave request successfully", async () => {
        
       
//       });
//     });
//   });
// });
