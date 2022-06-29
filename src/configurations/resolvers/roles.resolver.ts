import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateRoleInput } from '../dtos/create-role.input';
import { FiltersRolesInput } from '../dtos/filters-roles.input';
import { ResponseRoles } from '../dtos/response-roles';
import { UpdateRoleInput } from '../dtos/update-role.input';
import { Role } from '../entities/role.entity';
import { Permissions, RequirePermissions } from '../libs/permissions.decorator';
import { RolesService } from '../services/roles.service';

@Resolver()
export class RolesResolver {
	constructor(private readonly rolesService: RolesService) {}

	@Query(() => ResponseRoles, {
		name: 'roles',
		description: 'Listado de las roles',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_ROLES)
	findAll(
		@Args({
			name: 'filtersRolesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para los roles',
		})
		_: FiltersRolesInput,
		@Context() context,
	) {
		return this.rolesService.findAll(context.req.body.variables.input);
	}

	@Query(() => Role, {
		name: 'roleId',
		description: 'Obtiene el rol por el identificador',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_ROLES)
	findById(@Args('id', { description: 'Identificador del rol' }) id: string) {
		return this.rolesService.findById(id);
	}

	@Mutation(() => Role, {
		name: 'createRole',
		description: 'Crea una rol',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	create(
		@Args('createRoleInput', {
			description: 'Datos para la creación del rol',
		})
		_: CreateRoleInput,
		@Context() context,
	) {
		return this.rolesService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Role, {
		name: 'updateRole',
		description: 'Actualiza un rol',
	})
	@RequirePermissions(Permissions.UPDATE_CONFIGURATION_ROLE)
	update(
		@Args('id', {
			description: 'Identificador del rol para actualizar',
		})
		id: string,
		@Args('updateRoleInput', {
			description: 'Datos para actualizar el rol',
		})
		_: UpdateRoleInput,
		@Context() context,
	) {
		return this.rolesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}
