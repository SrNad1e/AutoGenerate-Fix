/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { SendMailService } from 'src/send-mail/services/send-mail.service';
import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { SignUpInput } from '../dtos/signup.input';
import { Shop } from '../entities/shop.entity';
import { StatusUser, User } from '../entities/user.entity';
import { RolesService } from './roles.service';
import { TokensService } from './tokens.service';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Shop.name) private readonly shopModel: PaginateModel<Shop>,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly customersService: CustomersService,
		private readonly rolesService: RolesService,
		private readonly sendMailService: SendMailService,
		private readonly tokensService: TokensService,
	) {}

	async login(
		user: User,
		{ companyId }: LoginUserInput,
	): Promise<LoginResponse> {
		const companies = user.companies?.map((company) => company._id.toString());

		if (user.username !== 'admin' && !companies.includes(companyId)) {
			throw new UnauthorizedException(
				`El usuario no tiene acceso a la compañia`,
			);
		}

		if (user.status === StatusUser.INACTIVE) {
			throw new UnauthorizedException(`El usuario se encuentra inactivo`);
		}

		if (user.status === StatusUser.SUSPEND) {
			throw new UnauthorizedException(`El usuario se encuentra suspendido`);
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
			customer = await this.customersService.create(
				{
					email,
					firstName,
					lastName,
					document,
					customerTypeId,

					...params,
				},
				{
					username: 'admin',
				} as User,
			);
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

		const newUser = await this.usersService.create(
			{
				name: `${firstName} ${lastName}`,
				username: email,
				password,
				roleId: role._id.toString(),
				shopId: shop._id.toString(),
				customerId: customer._id.toString(),
				isWeb: true,
			},
			{
				name: 'Administrador del sistema',
				username: 'admin',
			} as User,
			companyId,
		);

		return {
			user: newUser,
			access_token: this.jwtService.sign({
				username: newUser.username,
				companyId,
				sub: newUser._id,
			}),
		};
	}

	async recoveryPassword(email: string) {
		const user = await this.usersService.findOne({ username: email });

		if (!user) {
			throw new UnauthorizedException(
				`El usuario ${email} no se encuentra registrado`,
			);
		}

		if (user.status !== StatusUser.ACTIVE) {
			throw new UnauthorizedException(
				`El usuario ${email} no se encuentra activo`,
			);
		}

		try {
			await this.tokensService.inactiveToken(user);
			const token = await this.tokensService.generateToken(
				user,
				dayjs().add(1, 'd').toDate(),
			);

			await this.sendMailService.sendRecoveryPassword(user, token?.code);
			return true;
		} catch (e) {
			console.log(e);
		}
	}

	async changePasswordToken(code: string, password: string) {
		const token = await this.tokensService.validateToken(code);

		if (!token) {
			throw new UnauthorizedException(
				'El token ya se ha vencido o fue inactivado, solicite uno nuevo',
			);
		}

		await this.tokensService.inactiveToken(token.user as unknown as User);

		const user = await this.usersService.update(
			token?.user['_id']?.toString(),
			{
				password,
			},
			token.user as unknown as User,
			token.user['companies'][0]?.toString(),
		);

		return {
			access_token: this.jwtService.sign({
				username: user.username,
				companyId: token.user['companies'][0]?.toString(),
				sub: user._id,
			}),
			user,
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
		const userFind = await this.usersService.findOne({ username });

		if (!userFind) {
			throw new UnauthorizedException(`Usuario no existe`);
		}

		if (!bcrypt.compareSync(passwordOld, userFind.password)) {
			throw new UnauthorizedException(`Usuario o contraseña incorrectos`);
		}

		const { password, user, ...userSent } = userFind;

		return userSent;
	}
}
