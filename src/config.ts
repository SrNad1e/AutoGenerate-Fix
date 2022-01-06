import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
	mongo: {
		dbName: process.env.MONGO_DB,
		//	user: process.env.MONGO_USER,
		host: process.env.MONGO_HOST,
		//	password: process.env.MONGO_PASSWORD,
		port: parseInt(process.env.MONGO_PORT, 10),
		connection: process.env.MONGO_CONNECTION,
	},
}));
