import { DataTypes, Model, Sequelize } from 'sequelize';
import Loader from '../Loaders';


class LeaveRequest extends Model {
 
  static associate(models: any) {
    // define association here
  }
}

LeaveRequest.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending"
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  confirmMessage: {
    type: DataTypes.STRING,
  },
}, {
  sequelize: Loader.sequelize, // Update this with your Sequelize instance
});

export default LeaveRequest;
