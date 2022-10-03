import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCreditInput } from '../dtos/create-credit.input';
import { FiltersCreditInput } from '../dtos/filters-credit.input';
import { FiltersCreditsInput } from '../dtos/filters-credits.input';
import { ResponseCredits } from '../dtos/response-credits';
import { UpdateCreditInput } from '../dtos/update-credit.input';
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
		description: 'Crédito',
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

	@Query(() => Credit, {
		name: 'credit',
		description: 'Crédito',
	})
	@RequirePermissions(Permissions.READ_CREDITS)
	findOne(
		@Args({
			name: 'filtersCreditInput',
			description: 'Filtros para buscar el crédito',
		})
		_: FiltersCreditInput,
		@Context() context,
	) {
		return this.creditsService.findOne(context.req.body.variables.input);
	}

	@Mutation(() => Credit, {
		name: 'createCredit',
		description: 'Asigna el crédito a un cliente',
	})
	@RequirePermissions(Permissions.CREATE_CREDIT)
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
	@RequirePermissions(Permissions.UPDATE_CREDIT)
	update(
		@Args({
			name: 'id',
			description: 'Identificador del crédito a actualizar',
		})
		id: string,
		@Args({
			name: 'updateCreditInput',
			description: 'Datos para actualizar un crédito',
		})
		_: UpdateCreditInput,
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
