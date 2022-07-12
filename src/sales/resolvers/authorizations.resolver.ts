import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateAuthorizationInput } from '../dtos/create-authorization.input';
import { FiltersAuthorizationInput } from '../dtos/filters-authorization.input';
import { ResponseAuthorizations } from '../dtos/response-authorizations';
import { AuthorizationDian } from '../entities/authorization.entity';
import { AuthorizationsService } from '../services/authorizations.service';

@Resolver()
export class AuthorizationsResolver {
	constructor(private readonly authorizationsService: AuthorizationsService) {}

	@Query(() => ResponseAuthorizations, {
		name: 'authorizations',
		description: 'Lista de autorizaciones',
	})
	@RequirePermissions(Permissions.READ_INVOICING_AUTHORIZATIONS)
	findAll(
		@Args({
			name: 'filtersAuthorizations',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de autorizaciones de facturación',
		})
		_: FiltersAuthorizationInput,
		@Context() context,
	) {
		return this.authorizationsService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => AuthorizationDian, {
		name: 'createAuthorization',
		description: 'Crea una autorización de facturación',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_AUTHORIZATION)
	create(
		@Args({
			name: 'createAuthorization',
			nullable: true,
			defaultValue: {},
			description: 'Datos para crear la autorización de facturación',
		})
		_: CreateAuthorizationInput,
		@Context() context,
	) {
		return this.authorizationsService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
