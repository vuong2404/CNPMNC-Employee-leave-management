import { injectable } from "inversify";
import Token from "../../Models/Token";
import { ITokenRepository } from "../ITokenRepository";
import { BaseRepository } from "./BaseRepository";


@injectable()
export class TokenRepository
	extends BaseRepository<Token>
	implements ITokenRepository
{
	constructor() {
		super(Token);
	}

    public async clearTokens(userId: number): Promise<any> {
        this._model.destroy({where: {
            userId
        }})
    }

    public async removeToken(token: string, userId: number): Promise<number> {
		return await Token.destroy({where: {userId, value: token}})
	}
}
