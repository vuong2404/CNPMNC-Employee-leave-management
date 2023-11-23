import { Router } from "express";
import { IAuthController} from "../Controllers";
import { AuthMiddleware, AuthValidators } from "../Middlewares";
import { container } from "../Configs";
import { TYPES } from "../Types/type";


const authController = container.get<IAuthController>(TYPES.IAuthController)
const router = Router()
router.post('/login', AuthValidators.loginValidator, authController.login)
router.post('/refresh', authController.refreshToken)

router.delete('/logout', AuthMiddleware.initialize, authController.logout)
router.delete('/logout/all', AuthMiddleware.initialize, authController.logoutAllDevices)

export default router ;