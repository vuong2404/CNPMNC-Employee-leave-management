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
	IUserController,
	UserController,
} from "../Controllers";


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

		// register service 
		this.container.bind<IAuthenticationService>(TYPES.IAuthenticationService).to(AuthenticationService);
		this.container.bind<IAuthorizationService>(TYPES.IAuthorizationService).to(AuthorizationService);
		this.container.bind<IUserService>(TYPES.IUserService).to(UserService);

		// register repository
		this.container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
		this.container.bind<IPermissionRepository>(TYPES.IPermissionRepository).to(PermissionRepository);
		this.container.bind<ITokenRepository>(TYPES.ITokenRepository).to(TokenRepository);

	}
}

const containerObj = new InversifyContainer();
export default containerObj.getContainer();;
