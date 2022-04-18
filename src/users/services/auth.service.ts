/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { CompaniesService } from 'src/configurations/services/companies.service';
import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly companiesService: CompaniesService,
	) {}

	async login(
		user: User,
		{ companyId }: LoginUserInput,
	): Promise<LoginResponse> {
		if (
			user.username !== 'admin' &&
			user.company._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no tiene acceso a la compañia`,
			);
		}
		return {
			access_token: this.jwtService.sign({
				username: user.username,
				company: user.company._id,
				sub: user._id,
			}),
			user,
		};
	}

	async signup(userCreate: Partial<User>): Promise<User> {
		const user = await this.usersService.findOne(userCreate?.username);
		const company = await this.companiesService.findById(userCreate.id);

		if (!company) {
			throw new NotFoundException('La empresa no existe');
		}

		if (user) {
			throw new NotFoundException(
				`El usuario ${userCreate.username} ya existe`,
			);
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
	): Promise<Partial<User>> {
		const user = await this.usersService.findOne(username);
		if (!user) {
			throw new UnauthorizedException(`Usuario no existe`);
		}

		if (!bcrypt.compareSync(passwordOld, user.password)) {
			throw new UnauthorizedException(`Usuario o contraseña incorrectos`);
		}

		const { password, ...userSent } = user;
		return userSent;
	}
}
