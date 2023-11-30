// tests/Repositories/UserRepository.test.ts
import { Sequelize } from "sequelize";
import { PermissionRepository, UserRepository } from "../../src/Repositories";
import Tables, { Permission, User } from "../../src/Models";
import { CreateUsersData } from "../mockData/user";
import Loader from "../../src/Loaders";
import { throws } from "assert";
import { error } from "console";
import { RecordNotFoundError } from "../../src/Errors";

describe("UserRepository", () => {
	let userRepository: UserRepository;

	beforeAll(async () => {
		// Set up a test database connection
		const tables = new Tables();
		const loader = new Loader();
		await loader.load();
		await tables.createTables();
		await Loader.sequelize.sync({ force: true });
		userRepository = new UserRepository();
	});

	afterEach(async () => {
		// Close the database connection after all tests
		// await Loader.sequelize.close();
		await Loader.sequelize.sync({ force: true });
	});

	describe("Get all user", () => {
		it("should get all user", async () => {
			const usersData = CreateUsersData;
			try {
				await Promise.all(usersData.map((userData) => User.create(userData)));
			} catch (error) {
				console.log(error);
			}
			const users = await userRepository.all();
			// expect(users).toBeInstanceOf(Array);
			expect(users.length).toEqual(CreateUsersData.length);
			expect(users[0]).toHaveProperty("approvedDays");
			expect(users[1]).toHaveProperty("approvedDays");
			expect(users[2]).toHaveProperty("approvedDays");
		});
	});

	describe("Find user by id method", () => {
		it("should return a user by ID with associated approved days", async () => {
			const user = await User.create(CreateUsersData[0]);

			const result = await userRepository.findById(user.id);
			expect(result).toBeInstanceOf(User);
			expect(result).toHaveProperty("approvedDays");
		});

		it("should return null for non-existent ID", async () => {
			const nonExistentId = 999;
			const foundUser = await userRepository.findById(nonExistentId);
			expect(foundUser).toBeNull();
		});
	});

	describe("createUser", () => {
		it("should create a new user", async () => {
			const createdUser = await userRepository.create(CreateUsersData[0]);
			expect(createdUser).toBeInstanceOf(User);
		});
	});

	describe("Update user", () => {
		it("should update a user", async () => {
			const createdUser = await userRepository.create(CreateUsersData[0]);

			const dataTOUpdate = {
				firstname: "First name updated",
				email: "test@gmail.com",
				lastname: "Last name updated",
			};

			const user = await userRepository.update(createdUser.id, dataTOUpdate);
			expect(user).toBeInstanceOf(User);
			expect(user.firstname).toEqual("First name updated");
			expect(user.lastname).toEqual("Last name updated");
			expect(user.email).toEqual("test@gmail.com");
		});

		it("should throw RecordNotFound if cannot found user", async () => {
			const nonExistentUserId = 999;
			const dataToUpdate = {
				firstname: "First name updated",
				email: "test@gmail.com",
				lastname: "Last name updated",
			};
			await expect(
				userRepository.update(nonExistentUserId, dataToUpdate),
			).rejects.toStrictEqual(new RecordNotFoundError());
		});
	});

	describe("Delete user by id", () => {
		it("should delete user by ID", async () => {
			// Create a user for testing
			const newUser = await User.create(CreateUsersData[0]);
			const userId = newUser.id;

			const deletedUser = await userRepository.delete(userId);
			console.log(deletedUser);

			const users = await userRepository.all();

			expect(deletedUser).toEqual(true);
			expect(users.length).toEqual(0);
		});

		it("should return null for non-existent user ID", async () => {
			const nonExistentUserId = 999;

			await expect(userRepository.delete(nonExistentUserId)).rejects.toStrictEqual(
				new Error(),
			);
		});
	});

	describe("findByUsername", () => {
		it("should find a user by username", async () => {
			const username = "testUser";
			const user = await userRepository.findByUsername(username);
			expect(user).toBeNull();
		});
	});

	describe("findOrCreate", () => {
		it("should find an existing user by username", async () => {
			// Tạo một user mới
			await User.create(CreateUsersData[0]);

			// Tìm hoặc tạo user với username đã tồn tại
			const [user, created] = await userRepository.findOrCreate({
				username: "user1",
				hashedPassword: "123456",
				firstname: "Nguyen van",
				lastname: "A",
			});

			expect(created).toBe(false); // User đã tồn tại
			expect(user).toBeDefined();
		});

		it("should create a new user if not exists", async () => {
			const userData = {
				username: "newUser",
				email: "new@example.com",
				password: "password123",
			};

			// Tìm hoặc tạo user với username chưa tồn tại
			const [user, created] = await userRepository.findOrCreate({
				username: "user1",
				password: "123456",
				firstname: "Nguyen van",
				lastname: "A",
			});

			expect(created).toBe(true); // User mới được tạo
			expect(user).toBeDefined();
		});
	});

	describe("getLeaveRequests", () => {
		it("should get leave requests for an existing user", async () => {
			const user = await userRepository.create(CreateUsersData[0]);
			const leaveRequests = await userRepository.getLeaveRequests(user.id);

			expect(leaveRequests).toEqual([]); // Chưa có leave request nào cho user này
		});

		it("should throw RecordNotFoundError for non-existent user", async () => {
			const nonExistentUserId = 999; // ID của user không tồn tại
			await expect(
				userRepository.getLeaveRequests(nonExistentUserId),
			).rejects.toStrictEqual(new RecordNotFoundError());
		});
	});

	describe("getLeaveRequest", () => {
		it("should get a specific leave request for an existing user", async () => {
			const user = await userRepository.create(CreateUsersData[0]);
			const userId = 1;
			const requestId = 1;
			const leaveRequest = await userRepository.getLeaveRequest(userId, requestId);

			expect(leaveRequest).toEqual(null); // Chưa có leave request nào có ID 1 cho user này
		});

		it("should throw RecordNotFoundError for non-existent user", async () => {
			const nonExistentUserId = 999; // ID của user không tồn tại
			const leaveRequestId = 1; // ID của leave request tồn tại
			await expect(
				userRepository.getLeaveRequest(nonExistentUserId, leaveRequestId),
			).rejects.toStrictEqual(new RecordNotFoundError("User NOT FOUND"));
		});
	});
});
