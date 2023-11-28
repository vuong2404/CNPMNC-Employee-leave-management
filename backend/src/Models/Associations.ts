import { LeaveDay, LeaveRequest, User } from ".";
import ApprovedDay from "./ApprovedDay";
import Token from "./Token";

class Association {
	public static async initialize() {
		try {
			console.log("Model association");
			User.associate();
			Token.associate();
			LeaveRequest.associate();
			LeaveDay.associate();
			ApprovedDay.associate();

			//  await ApprovedDay.create({ userId: 2, leaveDayId: 3 });
			//  await ApprovedDay.create({ userId: 3, leaveDayId: 3 });
			//  await ApprovedDay.create({ userId: 4, leaveDayId: 3 });
			// //  await ApprovedDay.create({ userId: 5, leaveDayId: 3 });
			const user = await User.findByPk(6, {
				include: [{ model: LeaveDay, as: "approvedDays"}],
			});

			await user?.save()

			
			// // console.log(user);
			// // const leaveRequest = await user?.getLeaveRequests({ attributes: ["id"] });
			// if (user) {
			// 	const leaveRequests = await user?.getLeaveRequests(); 
			// 	// console.log(leaveRequests[0])

			// 	const leaveDays = await leaveRequests[0].getLeaveDays()

			// 	// console.log(leaveDays)

			// 	const result = await user.addApprovedDays(leaveDays)

			// 	// console.log(result)

			// 	await user.save()
			// 	// const approvedDays = await user.getApprovedDays();
	
			// 	// console.log(leaveRequest);
	
			// 	// console.log("Approved days:", JSON.stringify(approvedDays));

			// }
			// User.create({firstname: "Fsfdsa", lastname: "fdfadf", username: "manager", hashedPassword: "manager"})
			// Token.create({userId: 1, value: "fdfdsafadsfad"})
		} catch (err) {
			console.log("Initialize association failed!");
			console.log(`Err: ${err}`);
		}
	}
}

export default Association;
