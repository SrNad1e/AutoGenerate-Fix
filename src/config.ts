import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
	mongo: {
		dbName: process.env.MONGO_DB,
		user: process.env.MONGO_USER,
		password: process.env.MONGO_PASSWORD,
		host: process.env.MONGO_HOST,
		port: parseInt(process.env.MONGO_PORT, 10),
		connection: process.env.MONGO_CONNECTION,
	},
	jwt: {
		secret: process.env.SECRET_TOKEN,
		expire: process.env.EXPIRE_TOKEN,
	},
	AWS: {
		region: process.env.AWS_REGION,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		publicBucketName: process.env.AWS_PUBLIC_BUCKET_NAME,
	},
	nodemailer: {
		host: process.env.NODEMAILER_HOST,
		port: process.env.NODEMAILER_PORT,
		secure: process.env.NODEMAILER_SECURE,
		user: process.env.NODEMAILER_USER,
		password: process.env.NODEMAILER_PASSWORD,
	},
	interapidisimo: {
		api: process.env.INTER_API,
	},
	FEDEX: {
		api: process.env.FEDEX_API,
		client_id: process.env.FEDEX_CLIENT_ID,
		client_secret: process.env.FEDEX_CLIENT_SECRET,
	},
}));
