import { Container } from "inversify";
import { TYPES } from "../Types/type";
import {
    ITokenRepository,
    TokenRepository,
	PermissionRepository,
	IPermissionRepository,
	UserRepository,
	IUserRepository,
} from "../Repositories";
import {
	AuthenticationService,
	AuthorizationService,
	IAuthenticationService,
	IAuthorizationService,
	IUserService,
	UserService,
} from "../Services";
import {
	AuthController,
	IAuthController,
	ILeaveRequestController,
	IUserController,
	LeaveRequestController,
	UserController,
} from "../Controllers";
import { ILeaveRequestService, LeaveRequestService } from "../Services/LeaveRequestService";
import { ILeaveRequestRepository } from "../Repositories/ILeaveRequestRepository";
import { LeaveRequestRepository } from "../Repositories/implementation/LeaveRequestRepository";


class InversifyContainer {
	private container;

	constructor() {
		this.container = new Container();
	}

	public getContainer(): Container {
		this.register();
		return this.container;
	}

	public register() {
		// register controller 
		this.container.bind<IAuthController>(TYPES.IAuthController).to(AuthController)
		this.container.bind<IUserController>(TYPES.IUserController).to(UserController)
		this.container.bind<ILeaveRequestController>(TYPES.ILeaveRequestController).to(LeaveRequestController)

		// register service 
		this.container.bind<IAuthenticationService>(TYPES.IAuthenticationService).to(AuthenticationService);
		this.container.bind<IAuthorizationService>(TYPES.IAuthorizationService).to(AuthorizationService);
		this.container.bind<IUserService>(TYPES.IUserService).to(UserService);
		this.container.bind<ILeaveRequestService>(TYPES.ILeaveRequestService).to(LeaveRequestService);

		// register repository
		this.container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
		this.container.bind<IPermissionRepository>(TYPES.IPermissionRepository).to(PermissionRepository);
		this.container.bind<ITokenRepository>(TYPES.ITokenRepository).to(TokenRepository);
		this.container.bind<ILeaveRequestRepository>(TYPES.ILeaveRequestRepository).to(LeaveRequestRepository);

	}
}

const containerObj = new InversifyContainer();
export default containerObj.getContainer();;
