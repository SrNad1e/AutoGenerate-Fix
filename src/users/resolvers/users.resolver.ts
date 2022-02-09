import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { UpdateUserInput } from '../dtos/update-user.input';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => [User], { name: 'users' })
	@UseGuards(JwtAuthGuard)
	findAll() {
		return this.usersService.findAll();
	}

	@Query(() => User, { name: 'user' })
	findOne(@Args('username', { type: () => String }) username: string) {
		return this.usersService.findOne(username);
	}

	@Mutation(() => User)
	@UseGuards(JwtAuthGuard)
	updateUser(
		@Args('updateUserInput') updateUserInput: UpdateUserInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.usersService.update(id, updateUserInput, context.user);
	}
}
