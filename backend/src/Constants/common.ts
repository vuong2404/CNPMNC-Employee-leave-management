export enum Role {
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
} 

export enum LeaveRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELED = "canceled",
}


export const DEFAULT_LEAVE_DAYS = 12