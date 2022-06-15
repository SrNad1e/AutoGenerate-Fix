import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCreditInput } from '../dtos/create-credit.input';
import { FiltersCreditsInput } from '../dtos/filters-credits.input';
import { ResponseCredits } from '../dtos/response-credits';
import { Credit } from '../entities/credit.entity';
import { CreditsService } from '../services/credits.service';

@Resolver()
export class CreditsResolver {
	constructor(private readonly creditsService: CreditsService) {}

	@Query(() => ResponseCredits, {
		name: 'credits',
		description: 'Lista de créditos',
	})
	@RequirePermissions(Permissions.READ_CREDITS)
	findAll(
		@Args({
			name: 'filtersCreditsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de créditos',
		})
		_: FiltersCreditsInput,
		@Context() context,
	) {
		return this.creditsService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => Credit, {
		name: 'creditId',
		description: 'Creadito',
	})
	@RequirePermissions(Permissions.READ_CREDITS)
	findById(
		@Args({
			name: 'id',
			description: 'Identificador del crédito',
		})
		id: string,
	) {
		return this.creditsService.findById(id);
	}

	@Mutation(() => Credit, {
		name: 'createCredit',
		description: 'Asigna el crédito a un cliente',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_CLOSEZ)
	create(
		@Args({
			name: 'createCreditInput',
			description: 'Datos para crear un crédito',
		})
		_: CreateCreditInput,
		@Context() context,
	) {
		return this.creditsService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Credit, {
		name: 'updateCredit',
		description: 'Actualiza el crédito de un cliente',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_CLOSEZ)
	update(
		@Args({
			name: 'id',
			description: 'Identificador del cliente a actualizar',
		})
		id: string,
		@Args({
			name: 'createCreditInput',
			description: 'Datos para crear un crédito',
		})
		_: CreateCreditInput,
		@Context() context,
	) {
		return this.creditsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
