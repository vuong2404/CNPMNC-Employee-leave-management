import { Router } from "express";
import { ILeaveRequestController } from "../Controllers";
import { container } from "../Configs";
import { TYPES } from "../Types/type";
import { LeaveRequestValidators } from "../Middlewares";

const leaveRequestController = container.get<ILeaveRequestController>(TYPES.ILeaveRequestController);
const router = Router();
router.get("/all", leaveRequestController.getAll);
router.get("/:id", leaveRequestController.getById);
router.post("/",  LeaveRequestValidators.createLeaveRequestValidator, leaveRequestController.create);
router.put("/approves",LeaveRequestValidators.approveRequestListValidator, leaveRequestController.approveMany);
router.put("/rejects",LeaveRequestValidators.rejectRequestListValidator, leaveRequestController.rejectMany);
router.put("/:id/approve", leaveRequestController.approve);
router.put("/:id/reject", leaveRequestController.reject);
router.put("/:id",  LeaveRequestValidators.updateLeaveRequestValidator, leaveRequestController.update);

router.put("/:id/cancel", leaveRequestController.cancel);
router.delete("/:id", leaveRequestController.deleteRequest);



export const leaveRequestRouter = router;
