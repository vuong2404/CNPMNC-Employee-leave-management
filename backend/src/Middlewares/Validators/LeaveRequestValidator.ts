import { body, param } from "express-validator";
const isValidDate = (value: any): boolean => {
	value = new Date(value)
	return !isNaN(value.getTime());
};
class LeaveRequestValidators {
	static createLeaveRequest = [
		body("title")
			.trim()
			.isLength({ min: 2, max: 40 })
			.withMessage("Title must be at least 2 and no more than 40 characters"),
		body("reason")
			.trim()
			.isLength({ min: 2, max: 400 })
			.withMessage("Title must be at least 2 and no more than 400 characters"),
		body("leaveDays")
			.isArray({ min: 1 })
			.withMessage(
				"Invalid leaveDays parameter. leaveDays is the array of Date and at least 1 day",
			)
			.custom((value: any[]) => {
				return value.every((date) => (isValidDate(date)));
			})
			.withMessage("Invalid Leave Day")
			.custom((value: any[]) => {
				return value.every((date) => (new Date(date) >= new Date()));
			})
			.withMessage("Leave day must be > current day"),
	];

	static updateLeaveRequest = [
		body("title")
			.trim()
			.isLength({ min: 2, max: 40 })
			.withMessage("Title must be at least 2 and no more than 40 characters"),
		body("reason")
			.trim()
			.isLength({ min: 2, max: 400 })
			.withMessage("Title must be at least 2 and no more than 400 characters"),
		body("leaveDays")
			.isArray()
			.withMessage(
				"Invalid leaveDays parameter. leaveDays is the array of Date",
			)
			.custom((value: any[]) => {
				return value.every((date) => (isValidDate(date)));
			})
			.withMessage("Invalid Leave Day")
			.custom((value: any[]) => {
				return value.every((date) => (new Date(date) >= new Date()));
			})
			.withMessage("Invalid Leave Day"),
	];
}

export { LeaveRequestValidators };
