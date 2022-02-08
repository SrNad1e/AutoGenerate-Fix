import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from '../dtos/create-user.input';

import { LoginResponse } from '../dtos/login-response';
import { LoginUserInput } from '../dtos/login-user.input';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@Resolver()
export class AuthResolver {
	constructor(private authService: AuthService) {}

	@Mutation(() => LoginResponse)
	@UseGuards(GqlAuthGuard)
	async login(
		@Args('loginUserInput') loginUserInput: LoginUserInput,
		@Context() context,
	): Promise<LoginResponse> {
		return this.authService.login(context.user);
	}

	@Mutation(() => LoginResponse)
	@UseGuards(JwtAuthGuard)
	async signup(
		@Args('createUserInput') createUserInput: CreateUserInput,
		@Context() context,
	): Promise<LoginResponse> {
		return this.authService.signup({
			...context.req.body.variables.input,
			user: context.req.user,
		});
	}
}
