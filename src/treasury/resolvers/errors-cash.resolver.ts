import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersErrorsCashInput } from '../dtos/filters-errorsCash.input';
import { ResponseErrorCash } from '../dtos/response-errors-cash';
import { VerifiedErrorsCashInput } from '../dtos/verified-errors-cash.input';
import { ErrorCash } from '../entities/error-cash.entity';
import { ErrorsCashService } from '../services/errors-cash.service';

@Resolver()
export class ErrorsCashResolver {
	constructor(private readonly errorsCashService: ErrorsCashService) {}

	@Query(() => ResponseErrorCash, {
		name: 'errorsCash',
		description:
			'Obtiene listado de traslados en error de productos entre bodegas',
	})
	@RequirePermissions(Permissions.READ_TREASURY_ERRORS_CASH)
	findAll(
		@Args({
			name: 'filtersErrorsCashInput',
			description: 'Filtros para listado de traslados en errores de efectivo',
		})
		_: FiltersErrorsCashInput,
		@Context() context,
	) {
		return this.errorsCashService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ErrorCash, {
		name: 'verifiedErrorsCash',
		description: 'Verifica un producto de un traslado en error',
	})
	@RequirePermissions(Permissions.VERIFIED_TREASURY_ERRRORS_CASH)
	verified(
		@Args('verifiedErrorsCashInput', {
			description: 'Datos para verificar errores de efectivo',
		})
		_: VerifiedErrorsCashInput,
		@Context() context,
	) {
		return this.errorsCashService.verified(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}
