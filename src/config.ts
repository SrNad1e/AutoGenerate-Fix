import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
	mongoAtlas: {
		uri: process.env.MONGO_ATLAS_URI,
		useUnifiedTopology: true,
	},
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
		signature: process.env.INTER_SIGNATURE,
		Authorization: process.env.INTER_AUTHORIZATION,
		city_default: process.env.INTER_CITY_DEFAULT,
		client_id: process.env.INTER_CLIENT_ID,
	},
	FEDEX: {
		api: process.env.FEDEX_API,
		client_id: process.env.FEDEX_CLIENT_ID,
		client_secret: process.env.FEDEX_CLIENT_SECRET,
		accountNumber: process.env.FEDEX_ACCOUNT_NUMBER,
		postalCode: process.env.FEDEX_POSTAL_CODE_DEFAULT,
		country: process.env.FEDEX_COUNTRY_DEFAULT,
	},
	API_URL: process.env.API_URL,
	API_WEB: process.env.API_WEB,
	USER_ADMIN: process.env.USER_ADMIN,
}));
