/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductSchema } from './entities/product.entity';
import { ProductMysql } from './entities/product.entity';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { ColorsResolver } from './resolvers/colors.resolver';
import { SizesResolver } from './resolvers/sizes.resolver';
import { SizesService } from './services/sizes.service';
import { ColorsService } from './services/colors.service';
import { Color, ColorMysql, ColorSchema } from './entities/color.entity';
import { Size, SizeMysql, SizeSchema } from './entities/size.entity';
import {
	Provider,
	ProviderMysql,
	ProviderSchema,
} from './entities/provider.entity';
import { ProvidersService } from './services/providers.service';
import { UsersModule } from 'src/users/users.module';
import { ProductsResolver } from './resolvers/products.resolver';
import { ShopsModule } from 'src/shops/shops.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Color.name, schema: ColorSchema },
			{ name: Size.name, schema: SizeSchema },
			{ name: Provider.name, schema: ProviderSchema },
		]),
		MongooseModule.forFeatureAsync([
			{
				name: Product.name,
				useFactory: () => {
					const schema = ProductSchema;
					schema.index({ reference: 1, description: 1, barcode: 1 }, {name: 'text'});
					return schema;
				},
			},
		]),
		TypeOrmModule.forFeature([
			ProductMysql,
			SizeMysql,
			ColorMysql,
			ProviderMysql,
		]),
		UsersModule,
		ShopsModule,
	],
	providers: [
		ProductsService,
		ColorsResolver,
		SizesResolver,
		SizesService,
		ColorsService,
		ProvidersService,
		ProductsResolver,
	],
	exports: [ProductsService],
	controllers: [ProductsController],
})
export class ProductsModule {}
