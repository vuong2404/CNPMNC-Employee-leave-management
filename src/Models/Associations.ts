import {
	User,
} from ".";
import Token from "./Token";

class Association {
	public static initialize() {
		try {
			User.associate();
            Token.associate() ;

		} catch (err) {
			console.log("Initialize association failed!");
			console.log(`Err: ${err}`);
		} 

	}
}

export default Association;
