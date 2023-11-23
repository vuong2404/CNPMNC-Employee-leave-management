import express, { Application, NextFunction, Request, Response, Router } from "express";
import authRouter from "./auth";
import { HttpStatusCode } from "../Constants";
import { NotFoundError } from "../Errors";
import { userRouter } from "./user";
import { AuthMiddleware } from "../Middlewares";
import { Authorization } from "../Middlewares/Authorization";

class Routers {
	public initialize(app: Application) {
		const router = Router();

		// User routes
		router.use(
			"/users",
			AuthMiddleware.initialize,
			Authorization.initialize,
			userRouter,
		);

		// Auth routes
		app.use("/auth", authRouter);

		// Add prefix
		app.use("/api", router);


		// API not found
		app._router.all(
			"*",
			(request: Request, response: Response, next: NextFunction) => {
				let err = new NotFoundError("API NOT FOUND");
				response.status(HttpStatusCode.NotFound).send(err.toPlainObject());
			},
		);
	}
}

const router = new Routers();

export default router;
