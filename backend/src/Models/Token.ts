// models/token.ts
import { DataTypes, Model } from "sequelize";
import Loader from "../Loaders";
import {User} from ".";


class Token extends Model {
	declare id: number;
	declare value: string;

	public static associate(): void {
		Token.belongsTo(User, {
			foreignKey: "userId",
		});
	}
}

Token.init(
	{
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		value: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
		},
		updatedAt: {
			type: DataTypes.DATE,
		},
	},
	{
		sequelize: Loader.sequelize,
	}
);

export default Token;
