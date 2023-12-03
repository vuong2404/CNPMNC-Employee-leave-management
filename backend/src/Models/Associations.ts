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

			
		} catch (err) {
			console.log("Initialize association failed!");
			console.log(`Err: ${err}`);
		}
	}
}

export default Association;
