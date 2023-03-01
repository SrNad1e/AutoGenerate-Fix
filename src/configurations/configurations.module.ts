import { Module, forwardRef } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

import { Conveyor, ConveyorSchema } from './entities/conveyor.entity';
import { CompanySchema } from './entities/company.entity';
import { CompaniesService } from './services/companies.service';
import { ConveyorsService } from './services/conveyors.service';
import { ConveyorsResolver } from './resolvers/conveyors.resolver';
import { CrmModule } from 'src/crm/crm.module';
import config from 'src/config';
import { Permission, PermissionSchema } from './entities/permission.entity';
import { Role, RoleSchema } from './entities/role.entity';
import {
	PointOfSale,
	PointOfSaleSchema,
} from 'src/sales/entities/pointOfSale.entity';
import { User, UserSchema } from './entities/user.entity';
import { UsersResolver } from './resolvers/users.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { LocalStrategy } from './libs/local.strategy';
import { JwtStrategy } from './libs/jwt.strategy';
import { RolesService } from './services/roles.service';
import { Image, ImageSchema } from './entities/image.entity';
import { ImagesService } from './services/images.service';
import { ImagesResolver } from './resolvers/images.resolver';
import { StaticfilesController } from './controllers/staticfiles.controller';
import { Shop, ShopSchema } from './entities/shop.entity';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
import { ShopsController } from './controllers/shops.controller';
import { ShopsService } from './services/shops.service';
import { WarehousesService } from './services/warehouses.service';
import { WarehousesResolver } from './resolvers/warehouses.resolver';
import { ShopsResolver } from './resolvers/shops.resolver';
import { PermissionsService } from './services/permissions.service';
import { PermissionsResolver } from './resolvers/permissions.resolver';
import { RolesResolver } from './resolvers/roles.resolver';
import { CompaniesResolver } from './resolvers/companies.resolver';
import { Order, OrderSchema } from 'src/sales/entities/order.entity';
import { SendMailModule } from 'src/send-mail/send-mail.module';
import { Token, TokenSchema } from './entities/token.entity';
import { TokensService } from './services/tokens.service';
import { InterapidisimoService } from './services/interapidisimo.service';
import { FedexService } from './services/fedex.service';
import { Product, ProductSchema } from 'src/products/entities/product.entity';
import { SalesModule } from 'src/sales/sales.module';
import {
	Reference,
	ReferenceSchema,
} from 'src/products/entities/reference.entity';

@Module({
	imports: [
		forwardRef(() => SalesModule),
		PassportModule,
		CrmModule,
		SendMailModule,
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
		}),
		JwtModule.registerAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { secret, expire } = configService.jwt;
				return {
					signOptions: { expiresIn: expire },
					secret: secret,
				};
			},
			inject: [config.KEY],
		}),
		MongooseModule.forFeature([
			{ name: 'Company', schema: CompanySchema },
			{ name: Conveyor.name, schema: ConveyorSchema },
			{
				name: Image.name,
				schema: ImageSchema,
			},
			{
				name: Permission.name,
				schema: PermissionSchema,
			},
			{
				name: PointOfSale.name,
				schema: PointOfSaleSchema,
			},
			{
				name: Role.name,
				schema: RoleSchema,
			},
			{
				name: Shop.name,
				schema: ShopSchema,
			},
			{
				name: Warehouse.name,
				schema: WarehouseSchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
			{
				name: Token.name,
				schema: TokenSchema,
			},
			{
				name: Product.name,
				schema: ProductSchema,
			},
			{
				name: Reference.name,
				schema: ReferenceSchema,
			},
		]),
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory: () => {
					const schema = UserSchema;

					schema.pre<User>('save', async function (next) {
						const user = this || undefined;

						const salt = await bcrypt.genSalt(10);
						const hashedPassword = await bcrypt.hash(user.password, salt);

						user.password = hashedPassword;

						next();
					});

					return schema;
				},
			},
		]),
	],
	providers: [
		AuthResolver,
		AuthService,
		CompaniesService,
		ConveyorsResolver,
		ConveyorsService,
		ImagesResolver,
		ImagesService,
		JwtStrategy,
		LocalStrategy,
		ShopsResolver,
		ShopsService,
		RolesService,
		UsersResolver,
		UsersService,
		WarehousesResolver,
		WarehousesService,
		PermissionsService,
		PermissionsResolver,
		RolesResolver,
		CompaniesResolver,
		TokensService,
		InterapidisimoService,
		FedexService,
	],
	controllers: [StaticfilesController, ShopsController],
	exports: [
		CompaniesService,
		ConveyorsService,
		UsersService,
		ShopsService,
		WarehousesService,
	],
})
export class ConfigurationsModule {}
