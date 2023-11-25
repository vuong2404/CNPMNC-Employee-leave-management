import { DataTypes, DateOnlyDataType, Model } from "sequelize";
import Loader from "../Loaders";
import LeaveRequest from "./LeaveRequest";
import ApprovedDay from "./ApprovedDay";
import User from "./User";

class LeaveDay extends Model {
	declare id: number;	
	declare date: DateOnlyDataType;	
	declare requestId: number
	public static associate() {
		LeaveDay.belongsTo(LeaveRequest, {
			foreignKey: "requestId",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		LeaveDay.belongsToMany(User, {
			through: ApprovedDay,
			foreignKey: "userId",
			otherKey: "leaveDayId",
		});
	}
}

LeaveDay.init(
	{
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
	},
	{
		sequelize: Loader.sequelize,
	},
);



export default LeaveDay;
