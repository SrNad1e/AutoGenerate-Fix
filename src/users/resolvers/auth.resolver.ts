import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { SignUpInput } from '../dtos/signup.input';
import { User } from '../entities/user.entity';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { AuthService } from '../services/auth.service';

@Resolver()
export class AuthResolver {
	constructor(private authService: AuthService) {}

	@Mutation(() => LoginResponse, {
		description: 'Se encarga de realizar el ingreso al sistema por el usuario',
	})
	@UseGuards(GqlAuthGuard)
	async login(
		@Args('loginUserInput', {
			description: 'Datos de usuario para realizar el login',
		})
		_: LoginUserInput,
		@Context() context,
	): Promise<LoginResponse> {
		return this.authService.login(
			context.user.user,
			context.req.body.variables.input,
		);
	}

	@Mutation(() => LoginResponse, {
		description: 'Se encarga de crear el usuario desde aplicaciones externas',
	})
	async signup(
		@Args('signUpInput', {
			description: 'Datos para la creación del usuario y cliente',
		})
		_: SignUpInput,
		@Context() context,
	) {
		return this.authService.signup({
			...context.req.body.variables.input,
		});
	}
}
