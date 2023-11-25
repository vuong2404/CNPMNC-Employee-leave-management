const TYPES = {

    // Controller symbol type
    IAuthController: Symbol.for("IAuthController"),
    IUserController: Symbol.for("IUserController"),
    ILeaveRequestController: Symbol.for("ILeaveRequestController"),

    // Service symbol type
    IAuthenticationService: Symbol.for("IAuthenticationService"),
    IAuthorizationService: Symbol.for("IAuthorizationService"),
    IUserService: Symbol.for("IUserService"),
    ILeaveRequestService: Symbol.for("ILeaveRequestService"),


    // Repository symbol type
    IBaseRepository: Symbol.for("IBaseRepository"),
    IUserRepository: Symbol.for("IUserRepository"),
    IPermissionRepository: Symbol.for("IPermissionRepository"),
    ITokenRepository: Symbol.for("ITokenRepository"),
    ILeaveRequestRepository: Symbol.for("ILeaveRequestRepository"),

};

export { TYPES };
