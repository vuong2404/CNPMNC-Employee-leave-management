const TYPES = {

    // Controller symbol type
    IAuthController: Symbol.for("IAuthController"),
    IUserController: Symbol.for("IUserController"),

    // Service symbol type
    IAuthenticationService: Symbol.for("IAuthenticationService"),
    IAuthorizationService: Symbol.for("IAuthorizationService"),
    IUserService: Symbol.for("IUserService"),

    // Repository symbol type
    IBaseRepository: Symbol.for("IBaseRepository"),
    IUserRepository: Symbol.for("IUserRepository"),
    IPermissionRepository: Symbol.for("IPermissionRepository"),
    ITokenRepository: Symbol.for("ITokenRepository"),

};

export { TYPES };
