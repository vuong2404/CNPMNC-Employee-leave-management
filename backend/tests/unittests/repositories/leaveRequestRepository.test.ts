// tests/Repositories/UserRepository.test.ts
import { Sequelize } from "sequelize";
import { LeaveRequestRepository, UserRepository } from "../../../src/Repositories/";
import Tables, { Permission, User, LeaveRequest } from "../../../src/Models";
import { CreateUsersData} from "../../mockData/user";
import { CreateLeaveRequest } from "../../mockData/leaveRequest";
import Loader from "../../../src/Loaders";
import { throws } from "assert";
import { error } from "console";
import { RecordNotFoundError } from "../../../src/Errors";
import { LeaveRequestStatus } from "../../../src/Constants";

describe("LeaveRequestRepository", () => {
    let leaveRequestRepository: LeaveRequestRepository
    let userRepository: UserRepository

    beforeAll(async () => {
		// Set up a test database connection
		const tables = new Tables();
		const loader = new Loader();
		await loader.load();
		await tables.createTables();
		await Loader.sequelize.sync({ force: true });
        leaveRequestRepository = new LeaveRequestRepository()
		userRepository = new UserRepository();
	});

	afterEach(async () => {
		// Close the database connection after all tests
		// await Loader.sequelize.close();
		await Loader.sequelize.sync({ force: true });
	});

    describe("Get all leave request", () => {
        it("should get all leave request", async () => {
            try {
                const leaveRequestData = CreateLeaveRequest
                const usersData = CreateUsersData;
                await Promise.all(usersData.map((userData) => User.create(userData)));
                await Promise.all(leaveRequestData.map((requestData) => LeaveRequest.create(requestData)));
            }
            catch(err) {
                console.log(err)
            }
            const leaveRequests = await leaveRequestRepository.all()
            expect(leaveRequests.length).toEqual(3);
			expect(leaveRequests[0]).toHaveProperty("User");
			expect(leaveRequests[1]).toHaveProperty("User");
			expect(leaveRequests[2]).toHaveProperty("User");

        })
    })

    describe("Get leave request by ID", () => {
        it("should get leave request for an existing user", async () => {
            try {
                const leaveRequestData = CreateLeaveRequest
                const usersData = CreateUsersData;
                await Promise.all(usersData.map((userData) => User.create(userData)));
                await Promise.all(leaveRequestData.map((requestData) => LeaveRequest.create(requestData)));
            }
            catch(err) {
                console.log(err)
            }
            const requestId = 1
            const leaveRequest = await leaveRequestRepository.findById(requestId)
            expect(leaveRequest).not.toBeNull()
            expect(leaveRequest).toBeInstanceOf(LeaveRequest)
            if (leaveRequest) {
                expect(leaveRequest.title).toMatch(/Leave request 1/)
            }
        })

        it("should throw error for an non-existing request", async () => {
            try {
                const leaveRequestData = CreateLeaveRequest
                const usersData = CreateUsersData;
                await Promise.all(usersData.map((userData) => User.create(userData)));
                await Promise.all(leaveRequestData.map((requestData) => LeaveRequest.create(requestData)));
            }
            catch(err) {
                console.log(err)
            }
            const requestId = 99
            await expect(leaveRequestRepository.findById(requestId))
            .rejects.toStrictEqual(new RecordNotFoundError());
        })
    })

    describe("Create new request", () => {
		it("should create a new request", async () => {
            const user = await User.create(CreateUsersData[0]);
			const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
			expect(createdRequest).toBeInstanceOf(LeaveRequest);
		});
    })

    describe("Update new request", () => {
        it("should update a request having original leave day nul", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                const userIdNum = user.id
                const requestIdNum = createdRequest.id
                const dataUpDate = {
                    title: "Reason 1",
                    userId: userIdNum,
                    leaveDays: ["2-13-2024"],
                    description: "Description 1",
                    reason: "Health Check"
                }
                const leaveRequest = await leaveRequestRepository.update(requestIdNum, dataUpDate);
                expect(leaveRequest).toBeInstanceOf(LeaveRequest);
                expect(leaveRequest.reason).toMatch(/Health Check/);
            }
            catch(err) {
                console.log(err)
            }
        })
        it("should update a request having original leave day not null", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                const userIdNum = user.id
                const requestIdNum = createdRequest.id
                const dataUpDate = {
                    title: "Reason 1",
                    userId: userIdNum,
                    leaveDays: [],
                    description: "Description 1",
                    reason: "Wedding party"
                }
                const leaveRequest = await leaveRequestRepository.update(requestIdNum, dataUpDate);
                expect(leaveRequest).toBeInstanceOf(LeaveRequest);
                expect(leaveRequest.reason).toMatch(/Wedding party/);
            }
            catch(err) {
                console.log(err)
            }
        })
        it("should throw error for updating an non-existing request", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                const userIdNum = user.id
                const requestIdNum = 99
                const dataUpDate = {
                    title: "Reason 1",
                    userId: userIdNum,
                    leaveDays: [],
                    description: "Description 1",
                    reason: "Wedding party"
                }
                await expect(leaveRequestRepository.update(requestIdNum, dataUpDate))
                    .rejects.toStrictEqual(new RecordNotFoundError());

            }
            catch(err) {
                console.log(err)
            }
        })
    })

    describe("Update status of a request", () => {
        it("should update status of a request", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                const result = await leaveRequestRepository.updateStatus(createdRequest.id, LeaveRequestStatus.APPROVED);
                expect(result).toEqual(true);
            }
            catch(err) {
                console.log(err)
            }
        })
    })

    describe("Delete a request", () => {
        it("should delete an existing request", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                const result = await leaveRequestRepository.deleteLeaveRequest(user.id, createdRequest.id);
                expect(result).toEqual(true);
            }
            catch(err) {
                console.log(err)
            }
        })
        it("should throw error for deleting an non-existing request", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                await expect(leaveRequestRepository.deleteLeaveRequest(user.id, 999))
                    .rejects.toStrictEqual(new RecordNotFoundError());
            }
            catch(err) {
                console.log(err)
            }
        })
        it("should throw error for deleting an non-existing user", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                await expect(leaveRequestRepository.deleteLeaveRequest(999, createdRequest.id))
                    .rejects.toStrictEqual(new RecordNotFoundError());
            }
            catch(err) {
                console.log(err)
            }
        })
        it("should throw error for deleting an non-existing user and non-existing request", async () => {
            try {
                const user = await User.create(CreateUsersData[0]);
                const createdRequest = await LeaveRequest.create(CreateLeaveRequest[0]);
                await expect(leaveRequestRepository.deleteLeaveRequest(999, 999))
                    .rejects.toStrictEqual(new RecordNotFoundError());
            }
            catch(err) {
                console.log(err)
            }
        })
    })

}) 
