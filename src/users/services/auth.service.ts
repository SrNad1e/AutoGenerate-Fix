/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { CompaniesService } from 'src/configurations/services/companies.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { SignUpInput } from '../dtos/signup.input';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly companiesService: CompaniesService,
		private readonly customersService: CustomersService,
	) {}

	async login(
		user: User,
		{ companyId }: LoginUserInput,
	): Promise<LoginResponse> {
		const companies = user.companies?.map((company) => company.toString());
		if (user.username !== 'admin' && !companies.includes(companyId)) {
			throw new UnauthorizedException(
				`El usuario no tiene acceso a la compañia`,
			);
		}
		return {
			access_token: this.jwtService.sign({
				username: user.username,
				companyId,
				sub: user._id,
			}),
			user,
		};
	}

	async signup({ email, document, companyId, ...params }: SignUpInput) {
		const user = await this.usersService.findOne(email);

		if (user) {
			throw new NotFoundException(
				`El correo ${email} ya está siendo usado por otro cliente`,
			);
		}

		let customer = await this.customersService.findOne({ document });

		if (!customer) {
			customer = await this.customersService.create({
				email,
				document,
				...params,
			});
		}
		/*const newUser = new this.usersService.create({
			companyId,
		});*/
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
