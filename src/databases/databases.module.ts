/* eslint-disable @typescript-eslint/no-var-requires */
import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import config from 'src/config';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, host, dbName, user, password } =
					configService.mongo;
				return {
					uri: `${connection}://${host}`,
					dbName,
					user,
					pass: password,
					retryWrites: true,
					w: 'majority',
					connectionFactory: (connection) => {
						connection.plugin(require('mongoose-paginate-v2'));
						connection.plugin(require('mongoose-aggregate-paginate-v2'));
						return connection;
					},
				};
			},
			inject: [config.KEY],
		}),
	],
	providers: [],
})
export class DatabasesModule {}
