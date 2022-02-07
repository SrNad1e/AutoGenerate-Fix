/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
	mongo: {
		dbName: process.env.MONGO_DB,
		host: process.env.MONGO_HOST,
		port: parseInt(process.env.MONGO_PORT, 10),
		connection: process.env.MONGO_CONNECTION,
	},
	mariadb: {
		dbName: process.env.MARIADB_DB,
		user: process.env.MARIADB_USER,
		password: process.env.MARIADB_PASSWORD,
		host: process.env.MARIADB_HOST,
		port: parseInt(process.env.MARIADB_PORT, 10),
	},
}));