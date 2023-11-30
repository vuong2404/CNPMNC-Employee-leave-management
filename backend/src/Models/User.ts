import { DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyCountAssociationsMixin, HasManySetAssociationsMixin } from "sequelize";
import Loader from "../Loaders";
import Token from "./Token";
import {
	Model,
	HasManyGetAssociationsMixin,
	HasManyRemoveAssociationsMixin,
	HasManyCreateAssociationMixin,
} from "sequelize";
import bcrypt from "bcrypt";

import { ACCESS_TOKEN, REFRESH_TOKEN, Role } from "../Constants";
import jwt from "jsonwebtoken";
import { Password, TokenUtil } from "../Utils";
import LeaveRequest from "./LeaveRequest";
import LeaveDay from "./LeaveDay";
import ApprovedDay from "./ApprovedDay";
import { BadRequestError } from "../Errors";
class User extends Model {
	declare createToken: HasManyCreateAssociationMixin<Token>;
	declare getTokens: HasManyGetAssociationsMixin<Token>;
	declare removeTokens: HasManyRemoveAssociationsMixin<Token, number>;

	declare getLeaveRequests: HasManyGetAssociationsMixin<LeaveRequest>;

	declare getApprovedDays: HasManyGetAssociationsMixin<LeaveDay> ;	
	declare addApprovedDays: HasManyAddAssociationsMixin<LeaveDay, LeaveDay> 
	declare setApprovedDays: HasManySetAssociationsMixin<LeaveDay, LeaveDay>
	declare countApprovedDays: HasManyCountAssociationsMixin

	declare id: number;
	declare username: string ;
	declare firstname: string;
	declare lastname: string;
	declare email: string;
	declare hashedPassword: string;
	declare readonly role: string;
	declare phone: string;
	declare gender: boolean;
	declare birthday: Date;
	declare avatar: Blob;
	declare remainingDays: number;

	public static associate() {
		console.log("User association") ;

		User.hasMany(Token, {foreignKey: "userId"})

		User.hasMany(LeaveRequest, {
			foreignKey: "userId"
		});

		User.belongsToMany(LeaveDay, {
			through: ApprovedDay,
			foreignKey: "userId",
			otherKey: "leaveDayId",
			as: "approvedDays"
		});
	}
	public async checkPassword(password: string) {
		console.log("Comparing password.....", password, this.hashedPassword);
		const result = await bcrypt.compare(password, this.hashedPassword);
		console.log(result ? "Password Ok!" : "Incorrect password");
		return result;
	}

	public async checkLeaveDays(leaveDays: LeaveDay[]) {
		// return await this.getApprovedDays();
	}

	public generateAccessToken() {
		const user = this;

		if (!ACCESS_TOKEN.secret) {
			throw Error("Can't found serket key!");
		}
		const accessToken = jwt.sign(
			{
				id: user.id.toString(),
				fullName: `${user.firstname} ${user.lastname}`,
				email: user.email,
				role: user.role,
			},
			ACCESS_TOKEN.secret,
			{
				expiresIn: ACCESS_TOKEN.expiry,
			},
		);

		return accessToken;
	}

	public async generateRefreshToken() {
		const user = this;

		if (!REFRESH_TOKEN.secret) {
			throw Error("Can't found serket key!");
		}
		const refreshToken = jwt.sign(
			{
				id: user.id.toString(),
			},
			REFRESH_TOKEN.secret,
			{
				expiresIn: REFRESH_TOKEN.expiry,
			},
		);

		const rTknHash = TokenUtil.hash(refreshToken, REFRESH_TOKEN.secret);

		await user.createToken({ value: rTknHash });
		await user.save();

		return refreshToken;
	}
}

User.init(
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING,
		},
		phone: {
			type: DataTypes.STRING,
		},
		firstname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		gender: {
			type: DataTypes.BOOLEAN,
		},
		birthday: {
			type: DataTypes.DATE,
		},
		avatar: {
			type: DataTypes.BLOB,
		},
		remainingDays: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 12,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: Role.EMPLOYEE,
		},
		hashedPassword: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
	},
	{
		defaultScope: {
			where: {
				isActive: true,
			},
		},
		scopes: {
			sendToClient: {
				attributes: [
					"id",
					"username",
					"email",
					"firstname",
					"lastname",
					"phone",
					"phone",
					"avatar",
					"remainingDays",
				],
			},
		},
		sequelize: Loader.sequelize,
	},
);

User.addHook("beforeCreate", async (instance) => {
	instance.setDataValue(
		"hashedPassword",
		await Password.hash(instance.getDataValue("hashedPassword")),
	);
});

// User.addHook("afterUpdate", (user: User) => {
// 	if (user.remainingDays < 0) {
// 		throw new BadRequestError()
// 	}
// })

User.addHook("beforeUpdate", async (instance: User) => {
	console.log("Before update user")
	const num = await instance.countApprovedDays() ;
	if (instance.remainingDays + num !== 12 ) {
		instance.update({remainingDays: 12 - num})
	}
})




export default User;
