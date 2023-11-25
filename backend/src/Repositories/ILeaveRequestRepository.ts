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
    create(data: LeaveRequestDTO):Promise<LeaveRequest> ;
    update(id: number, data: LeaveRequestDTO) : Promise<LeaveRequest> ;
    updateStatus(id:number, status: LeaveRequestStatus): Promise<any> ;
}