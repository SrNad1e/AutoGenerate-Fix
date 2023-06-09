/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../entities/role.entity';

import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.SECRET_TOKEN,
		});
	}

	async validate(
		payload: any,
	): Promise<{ user: Partial<User>; companyId: string }> {
		const { password, user, role, ...userLoad } =
			await this.usersService.findById(payload.sub);
		const newRole = {
			_id: role._id,
			rank: role['rank'],
			permissions: role['permissions'].map((permission) => ({
				action: permission.action,
			})),
		};
		return {
			user: { ...userLoad, role: newRole as any },
			companyId: payload?.companyId,
		};
	}
}
