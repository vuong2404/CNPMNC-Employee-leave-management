import { DataTypes, DateOnlyDataType, Model } from "sequelize";
import Loader from "../Loaders";
import LeaveRequest from "./LeaveRequest";

class ApprovedDay extends Model {
    declare userId: number ;
    declare leaveDayId: number ;
	declare date: DateOnlyDataType;
	public static associate() {}
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
		sequelize: Loader.sequelize,
	},
);

export default ApprovedDay;
