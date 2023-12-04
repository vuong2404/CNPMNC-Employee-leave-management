import Loader from "../../src/Loaders";
import Tables from "../../src/Models";
import { Server } from "../../src/app";

export const setUpApplication = async () => {
	const server = new Server();
	const tables = new Tables();
	const loader = new Loader();
	await loader.load();
	await tables.createTables();
	await Loader.sequelize.sync({ force: true });
	server.initial();

    return server.getApp()
};
