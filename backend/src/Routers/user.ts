import { Router } from "express";
import { IUserController, UserController } from "../Controllers";
import { AuthMiddleware, AuthValidators } from "../Middlewares";
import { Authorization } from "../Middlewares/Authorization";
import { container } from "../Configs";
import { TYPES } from "../Types/type";

const userController = container.get<IUserController>(TYPES.IUserController);
const router = Router();
router.get("/all", userController.getAllUser);
router.post("/", userController.getAllUser);
router.get("/all", userController.getAllUser);
router.get("/all", userController.getAllUser);

export const userRouter = router;
