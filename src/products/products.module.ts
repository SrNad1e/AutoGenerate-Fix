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
import { UsersModule } from 'src/users/users.module';
import { ProductsResolver } from './resolvers/products.resolver';
import { ShopsModule } from 'src/shops/shops.module';
import { Reference, ReferenceSchema } from './entities/reference.entity';
import { ReferencesService } from './services/references.service';
import { Brand, BrandSchema } from './entities/brand.entity';
import { Company, CompanySchema } from './entities/company.entity';
import { BrandsService } from './services/brands.service';
import { CompaniesService } from './services/companies.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Color.name, schema: ColorSchema },
			{ name: Size.name, schema: SizeSchema },
			{ name: Reference.name, schema: ReferenceSchema },
			{ name: Brand.name, schema: BrandSchema },
			{ name: Company.name, schema: CompanySchema },
		]),
		MongooseModule.forFeatureAsync([
			{
				name: Product.name,
				useFactory: () => {
					const schema = ProductSchema;
					schema.index(
						{ reference: 1, description: 1, barcode: 1 },
						{ name: 'text' },
					);
					return schema;
				},
			},
		]),
		TypeOrmModule.forFeature([ProductMysql, SizeMysql, ColorMysql]),
		UsersModule,
		ShopsModule,
	],
	providers: [
		ProductsService,
		ColorsResolver,
		SizesResolver,
		SizesService,
		ColorsService,
		ProductsResolver,
		ReferencesService,
		BrandsService,
		CompaniesService,
	],
	exports: [ProductsService],
	controllers: [ProductsController],
})
export class ProductsModule {}
