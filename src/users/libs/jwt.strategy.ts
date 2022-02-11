/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.SECRET_TOKEN,
			logging: true,
		});
	}

	async validate(payload: any): Promise<Partial<User>> {
		const { password, ...user } = await this.usersService.findById(payload.sub);
		return user;
	}
}
