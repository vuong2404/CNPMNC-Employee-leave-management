import { ErrorName, HttpStatusCode } from "../Constants";
import { BaseError } from "./BaseError";

export class CustomTokenExpiredError extends BaseError {
	constructor(
		public message = "Jwt expired. You can try to refresh this one!",
		public stackTrace?: string,
	) {
		super(HttpStatusCode.Unauthorized, ErrorName.TOKEN_EXPIRED, message, stackTrace);
	}
}
