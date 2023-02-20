/* eslint-disable @typescript-eslint/no-var-requires */
import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import config from 'src/config';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: async (configService: ConfigType<typeof config>) => {
				configService.mongoAtlas;
				return {
					uri: configService.mongoAtlas.uri,
					useUnifiedTopology: true,
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
