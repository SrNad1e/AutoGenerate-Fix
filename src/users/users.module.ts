/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

@Module({
	imports: [
		PassportModule,
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
		UsersResolver,
		UsersService,
		AuthService,
		AuthResolver,
		LocalStrategy,
		JwtStrategy,
	],
	exports: [UsersService],
})
export class UsersModule {}
