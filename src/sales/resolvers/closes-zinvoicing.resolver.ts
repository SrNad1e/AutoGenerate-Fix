import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCloseZInvoicingInput } from '../dtos/create-close-z-invoicing-input';
import { FiltersClosesZInvoicingInput } from '../dtos/filters-closes-z-invoicing-input';
import { ResponseClosesZInvoicing } from '../dtos/response-closes-z-invoicing';
import { VerifiedCloseZInput } from '../dtos/verified-close-z-input';
import { CloseZInvoicing } from '../entities/close-z-invoicing.entity';
import { ClosesZinvoicingService } from '../services/closes-zinvoicing.service';

@Resolver()
export class ClosesZinvoicingResolver {
	constructor(
		private readonly closesZInvoicingService: ClosesZinvoicingService,
	) {}

	@Query(() => ResponseClosesZInvoicing, {
		name: 'closesZInvoicing',
		description: 'Lista de cierres z',
	})
	@RequirePermissions(Permissions.READ_INVOICING_CLOSESZ)
	findAll(
		@Args({
			name: 'filtersClosesZInvoicing',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de cierres z',
		})
		_: FiltersClosesZInvoicingInput,
		@Context() context,
	) {
		return this.closesZInvoicingService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => CloseZInvoicing, {
		name: 'createCloseZInvoicing',
		description: 'Crea un cierre Z de facturación',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_CLOSEZ)
	create(
		@Args({
			name: 'createCloseZInvoicing',
			nullable: true,
			defaultValue: {},
			description: 'Datos para crear el cierre z de facturación',
		})
		_: CreateCloseZInvoicingInput,
		@Context() context,
	) {
		return this.closesZInvoicingService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => CloseZInvoicing, {
		name: 'updateCloseZInvoicing',
		description: 'actualiza un cierre Z de facturación',
	})
	update(
		@Args({
			name: 'updateCloseZInvoicing',
			nullable: true,
			defaultValue: {},
			description: 'Datos para actualizar el cierre z de facturación',
		})
		_: VerifiedCloseZInput,
		@Context() context,
	) {
		return this.closesZInvoicingService.verifiedClose(
			context.req.body.variables.input,
		);
	}
}
