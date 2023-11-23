import { injectable } from "inversify";
import { container } from "../Configs";
import { IPermissionRepository } from "../Repositories/IPermissionRepository";
import { TYPES } from "../Types/type";
import "reflect-metadata"

export interface IAuthorizationService {
	getPermisstions: (role: string) => Promise<any>
}

@injectable()
export class AuthorizationService implements IAuthorizationService {
    constructor(
        private permissionRepository = container.get<IPermissionRepository>(TYPES.IPermissionRepository)
    ) {}
    public async getPermisstions(role: string) {
        return await this.permissionRepository.findAllByRole(role)
    }
}