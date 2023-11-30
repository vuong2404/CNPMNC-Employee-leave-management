import { LeaveRequest, User } from "../Models";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email : string) : Promise<User | null> ;
    removeToken(token: string, user: User): Promise<User> ;
    findByUsername(username : string) : Promise<User | null> ;
    findOrCreate(data: any) : Promise<[User,boolean]> ;
    getLeaveRequests(userId: number) : Promise<LeaveRequest[]> ;
    getLeaveRequest(userId: number, leaveRequestId: number | string):Promise<LeaveRequest | null> ;
}