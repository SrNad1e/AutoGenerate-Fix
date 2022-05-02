/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { Shop } from 'src/shops/entities/shop.entity';
import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { SignUpInput } from '../dtos/signup.input';
import { User } from '../entities/user.entity';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Shop.name) private readonly shopModel: PaginateModel<Shop>,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly customersService: CustomersService,
		private readonly rolesService: RolesService,
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

	async signup({
		email,
		document,
		companyId,
		firstName,
		lastName,
		password,
		customerTypeId,
		...params
	}: SignUpInput) {
		const user = await this.usersService.findOne({ username: email });

		if (user) {
			throw new NotFoundException(
				`El correo ${email} ya está siendo usado por otro cliente`,
			);
		}

		let customer = await this.customersService.findOne({ document });

		if (!customer) {
			customer = await this.customersService.create({
				email,
				firstName,
				lastName,
				document,
				customerTypeId,
				...params,
			});
		} else {
			const userCustomer = await this.usersService.findOne({
				customerId: customer._id.toString(),
			});

			if (userCustomer) {
				throw new NotFoundException(
					`El cliente con documento ${document} ya está asignado a un usuario`,
				);
			}
		}

		const role = await this.rolesService.findOne({ name: 'Cliente' });

		if (!role) {
			throw new NotFoundException('El rol para cliente no existe');
		}

		const shop = await this.shopModel.findOne({ name: 'Mayoristas' }).lean();

		if (!shop) {
			throw new NotFoundException('La tienda Mayoristas no existe');
		}

		const newUser = await this.usersService.create({
			name: `${firstName} ${lastName}`,
			username: email,
			password,
			roleId: role._id.toString(),
			shopId: shop._id.toString(),
			companyId,
			customerId: customer._id.toString(),
		});

		return {
			user: newUser,
			access_token: this.jwtService.sign({
				username: newUser.username,
				companyId,
				sub: newUser._id,
			}),
		};
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
		const user = await this.usersService.findOne({ username });
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
