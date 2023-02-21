import { UnauthorizedException, Inject } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { DataGenerateInvoicesInput } from '../dtos/data-generate-invoices.input';
import { FiltersInvoicesInput } from '../dtos/filters-invoices.input';
import { ResponseInvoices } from '../dtos/response-invoices';
import { ResponseInvoicing } from '../dtos/response-invoicing';
import { InvoicesService } from '../services/invoices.service';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

@Resolver()
export class InvoicesResolver {
	constructor(
		private readonly invoicesService: InvoicesService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	@Query(() => ResponseInvoices, {
		name: 'invoices',
		description: 'Lista de facturas',
	})
	@RequirePermissions(Permissions.READ_INVOICING_INVOICES)
	findAll(
		@Args({
			name: 'filtersInvoices',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de facturas',
		})
		_: FiltersInvoicesInput,
		@Context() context,
	) {
		return this.invoicesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ResponseInvoicing, {
		name: 'invoicing',
		description: 'Generador de facturas',
	})
	@RequirePermissions(Permissions.READ_INVOICING_INVOICES)
	invoicing(
		@Args({
			name: 'dataGenerateInvoicesInput',
			description: 'Datos para generar la facturación',
		})
		_: DataGenerateInvoicesInput,
		@Context() context,
	) {
		if (context.req.user.user.username !== this.configService.USER_ADMIN) {
			throw new UnauthorizedException('No tienes acceso para este proceso');
		}

		return this.invoicesService.generateInvoices(
			context.req.body.variables.input,
		);
	}
}
