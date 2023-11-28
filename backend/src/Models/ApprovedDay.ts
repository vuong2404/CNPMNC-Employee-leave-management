import { DataTypes, DateOnlyDataType, Model } from "sequelize";
import Loader from "../Loaders";
import LeaveRequest from "./LeaveRequest";
import User from "./User";
import LeaveDay from "./LeaveDay";

class ApprovedDay extends Model {
	declare userId: number;
	declare leaveDayId: number;
	declare date: DateOnlyDataType;
	public static associate() {
		ApprovedDay.belongsTo(User, { foreignKey: "userId" });
		ApprovedDay.belongsTo(LeaveDay, { foreignKey: "leaveDayId" });
	}
}

ApprovedDay.init(
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		leaveDayId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["userId", "leaveDayId"],
			},
		],
		sequelize: Loader.sequelize,
	},
);


export default ApprovedDay;
