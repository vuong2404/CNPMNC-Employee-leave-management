import Loader from "../Loaders";
import Association from "./Associations";

class Tables {
    public async createTables() {
        try {
            await Association.initialize();
            // await Loader.sequelize.sync({alter:true}).then(() => console.log("Syncing..."))

        }
        catch (err) {
            console.log("Create all tables failed!");
            // console.log(`Err: ${err}`);
        }
    }
}

export default Tables;

export {default as User} from './User'
export {default as Permission} from './Permission'
export {default as LeaveRequest} from './LeaveRequest'
export {default as Token} from './Token'
export {default as LeaveDay} from './LeaveDay'
export {default as ApprovedDay} from './ApprovedDay'