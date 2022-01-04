import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'src/config';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, user, password, host, port, dbName } =
					configService.mongo;
				return {
					uri: `${connection}://${host}:${port}`,
					user,
					pass: password,
					dbName,
				};
			},
			inject: [config.KEY],
		}),
	],
	providers: [],
})
export class DatabasesModule {}
