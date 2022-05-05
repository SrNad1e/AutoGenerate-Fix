/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PassportModule } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';

import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { PermissionSchema, Permission } from './entities/permission.entity';
import { Role, RoleSchema } from './entities/role.entity';
import { User, UserMysql, UserSchema } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { LocalStrategy } from './libs/local.strategy';
import config from 'src/config';
import { JwtStrategy } from './libs/jwt.strategy';
import { Shop, ShopSchema } from 'src/shops/entities/shop.entity';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { CrmModule } from 'src/crm/crm.module';
import {
	PointOfSale,
	PointOfSaleSchema,
} from 'src/sales/entities/pointOfSale.entity';
import { RolesService } from './services/roles.service';

@Module({
	imports: [
		PassportModule,
		ConfigurationsModule,
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

					schema.plugin(require('mongoose-autopopulate'));
					return schema;
				},
			},
		]),
		TypeOrmModule.forFeature([UserMysql]),
	],
	providers: [
		UsersResolver,
		UsersService,
		AuthService,
		AuthResolver,
		LocalStrategy,
		JwtStrategy,
		RolesService,
	],
	exports: [UsersService],
})
export class UsersModule {}
