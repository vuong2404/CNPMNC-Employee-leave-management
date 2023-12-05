import { injectable } from "inversify";
import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { container } from "../Configs";
import { ILeaveRequestRepository } from "../Repositories/ILeaveRequestRepository";
import { TYPES } from "../Types/type";
import {
  BadRequestError,
  ForbiddenError,
  RecordNotFoundError,
  ValidationError,
} from "../Errors";
import { IUserRepository } from "../Repositories";
import { validationResult } from "express-validator";
import { DEFAULT_LEAVE_DAYS, LeaveRequestStatus } from "../Constants";
import Loader from "../Loaders";
import { LeaveRequest } from "../Models";
import { log } from "console";

export interface ILeaveRequestService {
  getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  approve: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  reject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  cancel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  search: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  deleteRequest: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}

@injectable()
export class LeaveRequestService implements ILeaveRequestService {
  private leaveRequestRepository = container.get<ILeaveRequestRepository>(
    TYPES.ILeaveRequestRepository
  );
  private userRequestRepository = container.get<IUserRepository>(
    TYPES.IUserRepository
  );
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.action === "read:any") {
        const result = await this.leaveRequestRepository.all();
        res.send({
          success: true,
          result: this.parseLeaveDay(result),
          //   result: result,
        });
      } else if (req.action === "read:own") {
        const leaveRequest = await this.userRequestRepository.getLeaveRequests(
          req.userId
        );
        res.send({
          success: true,
          result: this.parseLeaveDay(leaveRequest),
          // result: leaveRequest,
        });
      } else {
        throw new ForbiddenError();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.action === "read:any") {
        const result = await this.leaveRequestRepository.findById(
          Number(req.params["id"])
        );
        

        if (!result) {
          throw new RecordNotFoundError();
        }
        res.send({
          success: true,
          result: this.parseLeaveDay([result])[0],
        });
      } else if (req.action === "read:own") {
        const result = await this.userRequestRepository.getLeaveRequest(
          req.userId,
          req.params["id"]
        );

        if (!result) {
          throw new RecordNotFoundError("CANNOT found this leave request");
        }

        res.send({
          success: true,
          result: this.parseLeaveDay([result])[0],
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.array()[0].msg);
      }

      const { title, reason, description, leaveDays } = req.body;

      const result = await this.leaveRequestRepository.create({
        userId: req.userId,
        title,
        reason,
        description,
        leaveDays,
      });

      res.send({ success: true, result: this.parseLeaveDay([result])[0] });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.array()[0].msg);
      }

      const { title, reason, description, leaveDays } = req.body;

      if (req.action === "update:own") {
        const result = await this.leaveRequestRepository.update(
          Number(req.params["id"]),
          {
            userId: req.userId,
            title,
            reason,
            description,
            leaveDays,
          }
        );

        res.send({ success: true, result: this.parseLeaveDay([result])[0] });
      } else {
        throw new ForbiddenError();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public approve = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await Loader.sequelize.transaction();
    try {
      const id = Number(req.params["id"]);
      if (req.action === "update:any") {
        //  Check valid params["id"]
        const leaveRequest = await this.leaveRequestRepository.findById(id);
        if (!leaveRequest) {
          throw new RecordNotFoundError();
        }

        // Check leave Request status
        if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
          throw new BadRequestError(
            `CANNOT APPROVE the leave request with status ${leaveRequest.status}`
          );
        } else {
          // Get the leave days of the request
          const leaveDays = await leaveRequest.getLeaveDays({ transaction });

          // Find employee who create the request
          const user = await leaveRequest.getUser({ transaction });

          // Add the leave days in the request to the approved days of employee
          await user.addApprovedDays(leaveDays, { transaction });

          // Update remainings day of that employee
          const numOfLeaveDays = await user.countApprovedDays({ transaction });

          if (numOfLeaveDays > DEFAULT_LEAVE_DAYS) {
            throw new BadRequestError();
          }
          await user.update(
            { remainingLeaveDays: DEFAULT_LEAVE_DAYS - numOfLeaveDays },
            { transaction }
          );

          // Update status of leave request
          const result = await this.leaveRequestRepository.updateStatus(
            id,
            LeaveRequestStatus.APPROVED,
            transaction
          );

          await transaction.commit();
          res.send({ success: true, result });
        }
      } else {
        throw new ForbiddenError();
      }
    } catch (error) {
      transaction.rollback();
      next(error);
    }
  };
  public reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params["id"]);
      if (req.action === "update:any") {
        const leaveRequest = await this.leaveRequestRepository.findById(id);
        if (!leaveRequest) {
          throw new RecordNotFoundError();
        }
        if (!(leaveRequest.status === LeaveRequestStatus.PENDING)) {
          throw new BadRequestError(
            `CANNOT REJECT the leave request with status ${leaveRequest.status}`
          );
        } else {
          const result = await this.leaveRequestRepository.updateStatus(
            id,
            LeaveRequestStatus.REJECTED
          );
          res.send({ success: true });
        }
      } else {
        throw new ForbiddenError();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params["id"]);
      if (req.action === "update:own") {
        const leaveRequest = await this.leaveRequestRepository.findById(id);
        if (!leaveRequest) {
          throw new RecordNotFoundError();
        }
        if (!(leaveRequest.status === LeaveRequestStatus.PENDING)) {
          throw new BadRequestError(
            `CANNOT UPDATE the leave request with status ${leaveRequest.status}`
          );
        } else {
          const result = await this.leaveRequestRepository.updateStatus(
            id,
            LeaveRequestStatus.CANCELED
          );
          res.send({ success: true, result });
        }
      } else {
        throw new ForbiddenError();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public deleteRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params["id"]);
      const userId = Number(req.userId);
      if (req.action === "delete:own") {
        await this.leaveRequestRepository.deleteLeaveRequest(id, userId);
      } else {
        throw new ForbiddenError();
      }
      res.send({ success: true });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction) => {};

  // helper function
  private parseLeaveDay = (leaveRequests: LeaveRequest[]) => {
    const result = leaveRequests.map((leaveRequest: any) => {
      const leaveRequestJSON = leaveRequest.toJSON();
      const mappedLeaveDays = leaveRequestJSON.leaveDays
        ? leaveRequestJSON.leaveDays.map((leaveDay: any) => leaveDay.date)
        : [];

      return {
        ...leaveRequestJSON,
        leaveDays: mappedLeaveDays,
      };
    });

    return result;
  };
  //   private parseLeaveDay = (leaveRequests: LeaveRequest[]) => {
  // 	const result = leaveRequests.map((leaveRequest: any) => {
  // 		const leaveRequestJSON = leaveRequest.toJSON();
  // 		return {
  // 			...leaveRequestJSON,
  // 			leaveDays: leaveRequestJSON.leaveDays.map(
  // 				(leaveDay: any) => leaveDay.date,
  // 			),
  // 		};
  // 	});

  // 	return result;
  // };
}
