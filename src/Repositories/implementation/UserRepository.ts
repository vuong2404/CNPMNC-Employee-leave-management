import message from "../../Utils/Message";
import { injectable } from "inversify";
import "reflect-metadata";
import { BaseRepository } from "./BaseRepository";
import { User, Token } from "../../Models";
import { UserDTO, IUserRepository } from "../IUserRepository";

@injectable()
export class UserRepository
    extends BaseRepository<User>
    implements IUserRepository {
    constructor() {
        super(User);
    } 

    public async all(): Promise<User[]> {
        return await this._model.scope('sendToClient').findAll()
    }
    
    public async findByEmail(email: string): Promise<User | null> {
        return await this._model.findOne({ where: { email: email } });
    }

    public async removeToken(token: string, user: User): Promise<User> {
        let tokens = await user.getTokens();
        tokens = tokens.filter((tokenObj: Token) => tokenObj.value !== token);

        return await user.save();
    }
    
    public async findByUsername(username: string) {
        return await this._model.findOne({ where: { username } });
    }

    public async findOrCreate(data: UserDTO) {
        return await this._model.findOrCreate({
            where: { username: data.username },
            defaults: { ...data, hashedPassword: data.password },
        });
    }
}
