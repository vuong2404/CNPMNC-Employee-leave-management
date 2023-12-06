import { DataTypes, DateOnlyDataType, Model } from "sequelize";
import Loader from "../Loaders";
import LeaveRequest from "./LeaveRequest";
import ApprovedDay from "./ApprovedDay";
import User from "./User";

class LeaveDay extends Model {
	declare id: number;	
	declare date: DateOnlyDataType;	
	declare requestId: number
	public static  associate() {
		LeaveDay.belongsTo(LeaveRequest, {
			foreignKey: "requestId",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		LeaveDay.belongsToMany(User, {
			through: ApprovedDay,
			foreignKey: "leaveDayId",
			otherKey: "userId",
		});
	}
}

LeaveDay.init(
	{
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			unique: true
		},
		requestId: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		sequelize: Loader.sequelize,
	},
);


// LeaveDay.addHook("beforeCreate", (instance: LeaveDay) => {
// 	console.log("before update or insert. Check...........")
// }) 



export default LeaveDay;
