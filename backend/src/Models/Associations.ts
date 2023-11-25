import {
	LeaveDay,
	LeaveRequest,
	User,
} from ".";
import ApprovedDay from "./ApprovedDay";
import Token from "./Token";

class Association {
	public static initialize() {
		try {
			User.associate();
            Token.associate() ;
			LeaveRequest.associate()
			LeaveDay.associate()


		} catch (err) {
			console.log("Initialize association failed!");
			console.log(`Err: ${err}`);
		} 

	}
}

export default Association;
