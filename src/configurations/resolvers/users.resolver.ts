import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';

import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { UpdateUserInput } from '../dtos/update-user.input';
import { FiltersUsersInput } from '../dtos/filters-users.input';
import {
	Permissions,
	RequirePermissions,
} from '../../configurations/libs/permissions.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateUserInput } from '../dtos/create-user.input';

@Resolver(() => User)
export class UsersResolver {
	constructor(private readonly usersService: UsersService) {}

	@Query(() => [User], {
		name: 'users',
		description: 'Consulta todos los usuarios con base a los filtros',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_USERS)
	findAll(
		@Args('filtersUsersInput', {
			description: 'Filtros para consultar los usuarios',
		})
		_: FiltersUsersInput,
		@Context() context,
	) {
		return this.usersService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => User, {
		name: 'currentUser',
		description:
			'Se encarga de obtener el usuario dependiendo del token enviado',
	})
	@UseGuards(JwtAuthGuard)
	getCurrent(@Context() context) {
		return context.req.user.user;
	}

	@Mutation(() => User)
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_USER)
	createUser(
		@Args('createUserInput', {
			description: 'Datos a crear en el usuario',
		})
		_: CreateUserInput,
		@Context() context,
	) {
		return this.usersService.create(
			context.req.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => User)
	@RequirePermissions(Permissions.UPDATE_CONFIGURATION_USER)
	updateUser(
		@Args('updateUserInput', {
			description: 'Datos a actualizar en el usuario',
		})
		updateUserInput: UpdateUserInput,
		@Args('id', {
			description: 'Identificador del usuario que se desea actualizar',
		})
		id: string,
		@Context() context,
	) {
		return this.usersService.update(
			id,
			updateUserInput,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
