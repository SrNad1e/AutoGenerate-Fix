import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersCreditHistoryInput } from '../dtos/filters-creditHistory.input';
import { ResponseCreditHistory } from '../dtos/response-creditHistory';
import { CreditHistoryService } from '../services/credit-history.service';

@Resolver()
export class CreditHistoryResolver {
	constructor(private readonly creditHistoryService: CreditHistoryService) {}
	@Query(() => ResponseCreditHistory, {
		name: 'creditHistory',
		description: 'Historico de crédito',
	})
	@RequirePermissions(Permissions.READ_CREDITS)
	findOne(
		@Args({
			name: 'FiltersCreditHistoryInput',
			description: 'Filtros para el histórico de créditos',
		})
		_: FiltersCreditHistoryInput,
		@Context() context,
	) {
		return this.creditHistoryService.findOne(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
