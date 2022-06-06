import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCloseXInvoicingInput } from '../dtos/create-close-x-invoicing-input';
import { FiltersClosesXInvoicingInput } from '../dtos/filters-closes-x-invoicing-input';
import { ResponseClosesXInvoicing } from '../dtos/response-closes-x-invoicing';
import { CloseXInvoicing } from '../entities/close-x-invoicing.entity';
import { ClosesXInvoicingService } from '../services/closes-xinvoicing.service';

@Resolver()
export class ClosesXinvoicingResolver {
	constructor(
		private readonly closesXInvoicingService: ClosesXInvoicingService,
	) {}

	@Query(() => ResponseClosesXInvoicing, {
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
}
