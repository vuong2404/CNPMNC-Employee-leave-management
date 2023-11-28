import {
	BelongsToGetAssociationMixin,
	DataTypes,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyGetAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManySetAssociationsMixin,
	Model,
	Sequelize,
} from "sequelize";
import Loader from "../Loaders";
import User from "./User";
import { LeaveDay } from ".";
import { LeaveRequestStatus } from "../Constants";

class LeaveRequest extends Model {
	declare setLeaveDays: HasManySetAssociationsMixin<LeaveDay, LeaveDay[]>;
	declare getLeaveDays: HasManyGetAssociationsMixin<LeaveDay>;
	declare removeLeaveDays: HasManyRemoveAssociationsMixin<LeaveDay, LeaveDay[]>;
	declare createLeaveDay: HasManyCreateAssociationMixin<LeaveDay>;
	declare addLeaveDays: HasManyAddAssociationsMixin<LeaveDay, LeaveDay>;
	declare addLeaveDay: HasManyAddAssociationMixin<LeaveDay, LeaveDay>;


	declare getUser: BelongsToGetAssociationMixin<User>

	declare status: LeaveRequestStatus ;


	public static associate() {
		console.log("LeaveRequest association") ;

		LeaveRequest.belongsTo(User, {
			foreignKey: "userId",
		});

		LeaveRequest.hasMany(LeaveDay, {
			foreignKey: "requestId",
			as: "leaveDays",
			onDelete: "CASCADE",
			onUpdate: "CASCADE"
		});
	}
}

LeaveRequest.init(
	{
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		reason: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: LeaveRequestStatus.PENDING,
		},
		confirmMessage: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize: Loader.sequelize, // Update this with your Sequelize instance
	},
);

export default LeaveRequest;
