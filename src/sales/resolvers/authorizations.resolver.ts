import { Query, Resolver } from '@nestjs/graphql';
import { ResponseAuthorizations } from '../dtos/response-authorizations';
import { AuthorizationsService } from '../services/authorizations.service';

@Resolver()
export class AuthorizationsResolver {
	constructor(private readonly authorizationsService: AuthorizationsService) {}

	/*@Query(() => ResponseAuthorizations, {
		name: 'closesXInvoicing',
		description: 'Lista de cierres x',
	})
	@RequirePermissions(Permissions.READ_INVOICING_CLOSESX)
	findAll(
		@Args({
			name: 'filtersClosesXInvoicing',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de cierres x',
		})
		_: FiltersClosesXInvoicingInput,
		@Context() context,
	) {
		return this.closesXInvoicingService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => CloseXInvoicing, {
		name: 'createCloseXInvoicing',
		description: 'Crea un cierre X de facturación',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_CLOSEX)
	create(
		@Args({
			name: 'createCloseXInvoicing',
			nullable: true,
			defaultValue: {},
			description: 'Datos para crear el cierre x de facturación',
		})
		_: CreateCloseXInvoicingInput,
		@Context() context,
	) {
		return this.closesXInvoicingService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}*/
}
