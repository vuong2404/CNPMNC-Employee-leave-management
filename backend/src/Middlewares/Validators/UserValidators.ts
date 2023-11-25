import { body, param } from "express-validator";
class UserValidator {
	static createUser = [
		body("firstname").trim().notEmpty().withMessage("firstname CANNOT be empty"),
		body("lastname").trim().notEmpty().withMessage("lastname CANNOT be empty"),
		body("username")
			.trim()
			.notEmpty()
			.withMessage("username CANNOT be empty")
			.isLength({ min: 4, max: 16 })
			.withMessage("Username must be at least 4 and no more than 16 characters")
		,
		body("password").trim().notEmpty().withMessage("password CANNOT be empty"),
	];
}

export { UserValidator };
