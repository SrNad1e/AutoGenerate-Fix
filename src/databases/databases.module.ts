/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from 'src/config';
import { Inventories } from 'src/inventories/entities/inventories.entity';
import { Shop as ShopMysql } from 'src/shops/entities/shopMysql.entity';
@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, /*user, password,*/ host, port, dbName } =
					configService.mongo;
				return {
					uri: `${connection}://${host}:${port}`,
					//	user,
					//	pass: password,
					dbName,
				};
			},
			inject: [config.KEY],
		}),
		TypeOrmModule.forRootAsync({
			inject: [config.KEY],
			useFactory: (configService: ConfigType<typeof config>) => {
				const { user, password, port, dbName, host } = configService.mariadb;
				return {
					type: 'mariadb',
					host,
					port,
					username: user,
					password,
					database: dbName,
					entities: [Inventories, ShopMysql],
				};
			},
		}),
	],
	providers: [],
	exports: [TypeOrmModule],
})
export class DatabasesModule {}
