const { body, param } = require("express-validator");
class AuthValidators {	
    static loginValidator = [
		body("username")
			.trim()
			.notEmpty()
			.withMessage("Username CANNOT be empty"),
		body("password").notEmpty().withMessage("Password CANNOT be empty"),
	];

	static signUpValidator = [
		body("username").trim().notEmpty().withMessage("Username CANNOT empty"),
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email CANNOT be empty")
			.bail()
			.isEmail()
			.withMessage("Email is invalid"),
		body("password").notEmpty().withMessage("Password CANNOT be empty"),
        body("firstname").notEmpty().withMessage("Firstname CANNOT be empty"),
        body("lastname").notEmpty().withMessage("Lastname CANNOT be empty")
	];
}

export { AuthValidators };
