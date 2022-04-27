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
import { BrandsService } from './services/brands.service';
import { Attrib, AttribSchema } from './entities/attrib.entity';
import {
	CategoryLevel1,
	CategoryLevel1Schema,
} from './entities/category-level1.entity';
import {
	CategoryLevel2,
	CategoryLevel2Schema,
} from './entities/category-level2.entity';
import {
	CategoryLevel3,
	CategoryLevel3Schema,
} from './entities/category-level3.entity';
import { ReferencesResolver } from './resolvers/references.resolver';
import { AttribsService } from './services/attribs.service';
import { AttribsResolver } from './resolvers/attribs.resolver';
import { BrandsResolver } from './resolvers/brands.resolver';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { CategoriesService } from './services/categories.service';
import { Image, ImageSchema } from 'src/staticfiles/entities/image.entity';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Color.name, schema: ColorSchema },
			{ name: Image.name, schema: ImageSchema },
			{ name: Size.name, schema: SizeSchema },
			{ name: Brand.name, schema: BrandSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: Attrib.name, schema: AttribSchema },
			{ name: CategoryLevel1.name, schema: CategoryLevel1Schema },
			{ name: CategoryLevel2.name, schema: CategoryLevel2Schema },
			{ name: CategoryLevel3.name, schema: CategoryLevel3Schema },
		]),
		MongooseModule.forFeatureAsync([
			{
				name: Reference.name,
				useFactory: () => {
					const schema = ReferenceSchema;
					schema.index({ name: 'text', description: 'text' }, { name: 'text' });
					return schema;
				},
			},
		]),
		TypeOrmModule.forFeature([ProductMysql, SizeMysql, ColorMysql]),
		UsersModule,
		ShopsModule,
		ConfigurationsModule,
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
		ReferencesResolver,
		AttribsService,
		AttribsResolver,
		BrandsResolver,
		CategoriesService,
	],
	exports: [ProductsService],
	controllers: [ProductsController],
})
export class ProductsModule {}
