import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conveyor, ConveyorSchema } from './entities/conveyor.entity';
import { Company, CompanySchema } from './entities/company.entity';
import { CompaniesService } from './services/companies.service';
import { ConveyorsService } from './services/conveyors.service';
import { ConveyorsResolver } from './resolvers/conveyors.resolver';
import { CrmModule } from 'src/crm/crm.module';
import config from 'src/config';
import { Permission, PermissionSchema } from './entities/permission.entity';
import { Role, RoleSchema } from './entities/role.entity';
import { Shop, ShopSchema } from 'src/shops/entities/shop.entity';
import {
	PointOfSale,
	PointOfSaleSchema,
} from 'src/sales/entities/pointOfSale.entity';
import { User, UserMysql, UserSchema } from './entities/user.entity';
import { UsersResolver } from './resolvers/users.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { LocalStrategy } from './libs/local.strategy';
import { JwtStrategy } from './libs/jwt.strategy';
import { RolesService } from './services/roles.service';

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
			{ name: Company.name, schema: CompanySchema },
			{ name: Conveyor.name, schema: ConveyorSchema },
			{
				name: Permission.name,
				schema: PermissionSchema,
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
				name: PointOfSale.name,
				schema: PointOfSaleSchema,
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
		TypeOrmModule.forFeature([UserMysql]),
	],
	providers: [
		AuthResolver,
		AuthService,
		CompaniesService,
		ConveyorsResolver,
		ConveyorsService,
		JwtStrategy,
		LocalStrategy,
		RolesService,
		UsersResolver,
		UsersService,
	],
	exports: [CompaniesService, ConveyorsService, UsersService],
})
export class ConfigurationsModule {}
