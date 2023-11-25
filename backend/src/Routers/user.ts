import { Router } from "express";
import { IUserController, UserController } from "../Controllers";
import { AuthMiddleware, AuthValidators, UserValidator } from "../Middlewares";
import { Authorization } from "../Middlewares/Authorization";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import { param } from "express-validator";

const userController = container.get<IUserController>(TYPES.IUserController);
const router = Router();
router.get("/all", userController.getAllUser);
router.get("/info", userController.getUserInfo);
router.get("/:id",param("id").isNumeric(), userController.getUserById);
router.post("/", UserValidator.createUser, userController.createUser);
router.put("/:id", userController.editUserInfo);
router.delete("/:id", userController.deleteUser);

export const userRouter = router;
