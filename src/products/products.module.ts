/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductSchema } from './entities/product.entity';
import { ProductMysql } from './entities/product.migration.entity';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { ColorsResolver } from './resolvers/colors.resolver';
import { SizesResolver } from './resolvers/sizes.resolver';
import { SizesService } from './services/sizes.service';
import { ColorsService } from './services/colors.service';
import { Color, ColorMysql, ColorSchema } from './entities/color.entity';
import { Size, SizeMysql, SizeSchema } from './entities/size.entity';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Product.name, schema: ProductSchema },
			{ name: Color.name, schema: ColorSchema },
			{ name: Size.name, schema: SizeSchema },
		]),
		TypeOrmModule.forFeature([ProductMysql, SizeMysql, ColorMysql]),
	],
	providers: [
		ProductsService,
		ColorsResolver,
		SizesResolver,
		SizesService,
		ColorsService,
	],
	exports: [ProductsService],
	controllers: [ProductsController],
})
export class ProductsModule {}
