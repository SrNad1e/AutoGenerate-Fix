import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';

import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { UpdateUserInput } from '../dtos/update-user.input';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FiltersUsersInput } from '../dtos/filters-users.input';

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => [User], {
		name: 'users',
		description: 'Consulta todos los usuarios con base a los filtros',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args('filtersUsersInput', {
			description: 'Filtros para consultar los usuarios',
		})
		_: FiltersUsersInput,
		@Context() context,
	) {
		return this.usersService.findAll(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Query(() => User, {
		name: 'currentUser',
		description:
			'Se encarga de obtener el usuario dependiendo del token enviado',
	})
	@UseGuards(JwtAuthGuard)
	getCurrent(@Context() context) {
		return context.req.user;
	}

	@Mutation(() => User)
	@UseGuards(JwtAuthGuard)
	updateUser(
		@Args('updateUserInput', {
			description: 'Datos a actualiazar en el usuario',
		})
		updateUserInput: UpdateUserInput,
		@Args('id', {
			description: 'Identificador del usuario que se desea actualizar',
		})
		id: string,
		@Context() context,
	) {
		return this.usersService.update(id, updateUserInput, context.req.user);
	}
}
