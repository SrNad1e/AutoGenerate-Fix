import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginResponse } from '../dtos/login-response';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async login(user: User): Promise<LoginResponse> {
		return {
			access_token: this.jwtService.sign({
				username: user.username,
				sub: user._id,
			}),
			user,
		};
	}

	async signup(userCreate: Partial<User>): Promise<User> {
		const user = await this.usersService.findOne(userCreate?.username);
		if (user) {
			throw new Error(`El usuario ${userCreate.username} ya existe`);
		}
		return this.usersService.create(userCreate);
	}

	/**
	 * @description se encarga de validar el usuario y la contraseña
	 * @param username usuario a validar
	 * @param password contraseña
	 * @returns usuario si existe o null
	 */
	async validateUser(
		username: string,
		passwordOld: string,
	): Promise<User> | undefined {
		const { password, ...user } = await this.usersService.findOne(username);

		if (user && bcrypt.compareSync(passwordOld, password)) {
			return user;
		}
		return null;
	}
}
