import { User } from "../Models";
import { IBaseRepository } from "./IBaseRepository";

export type UserDTO = {
    firstname: string,
    lastname: string,
    username: string,
    password: string
}
export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email : string) : Promise<User | null> ;
    removeToken(token: string, user: User): Promise<User> ;
    findByUsername(username : string) : Promise<User | null> ;
    findOrCreate(data: UserDTO) : Promise<[User,boolean]> ;
}