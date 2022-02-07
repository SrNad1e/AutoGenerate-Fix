import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionSchema, Permission } from './entities/permission.entity';
import { Role, RoleSchema } from './entities/role.entity';
import { User, UserMysql, UserSchema } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
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
				name: User.name,
				schema: UserSchema,
			},
		]),
		TypeOrmModule.forFeature([UserMysql]),
	],
	providers: [UsersResolver, UsersService],
	exports: [UsersService],
})
export class UsersModule {}
