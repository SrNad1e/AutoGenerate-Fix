import { Module } from '@nestjs/common';
import { ShopsService } from './services/shops.service';
import { ShopsController } from './controllers/shops.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './entities/shop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop as ShopMysql } from './entities/shopMysql.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
	imports: [
		UsersModule,
		MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
		TypeOrmModule.forFeature([ShopMysql]),
	],
	providers: [ShopsService],
	controllers: [ShopsController],
	exports: [ShopsService],
})
export class ShopsModule {}
