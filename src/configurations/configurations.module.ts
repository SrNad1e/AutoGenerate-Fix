import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

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

@Module({
	imports: [
		PassportModule,
		CrmModule,
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
		//	TypeOrmModule.forFeature([UserMysql, ShopMysql, WarehouseMysql]),
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
