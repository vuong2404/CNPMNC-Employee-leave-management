import { Transaction } from "sequelize";
import { LeaveRequestStatus } from "../Constants";
import { LeaveRequest, Permission } from "../Models";
import { IBaseRepository } from "./IBaseRepository";


export type LeaveRequestDTO = {
    title: string,
    reason: string,
    description: string,
    userId: number ,
    leaveDays: string[]
}
export interface ILeaveRequestRepository extends IBaseRepository<LeaveRequest> {
    create(data: LeaveRequestDTO, transaction?:Transaction):Promise<LeaveRequest> ;
    update(id: number, data: LeaveRequestDTO, transaction?:Transaction) : Promise<LeaveRequest> ;
    updateStatus(id:number, status: LeaveRequestStatus, transaction?:Transaction): Promise<any> ;
    updateStatusByIds(ids: number[],status:string, transaction?: Transaction): Promise<any>
    deleteLeaveRequest(id: number,  data: number): Promise<boolean>;
}