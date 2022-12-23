import { FiltersDailyClosing } from './../dtos/filters-daily-closing.input';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { ResponseDailyClosing } from '../dtos/response-daily-closing';
import { DailyClosingService } from '../services/daily-closing.service';
import { ResponseGenerateDailyClosing } from '../dtos/response-generate-daily-closing';
import { GenerateDailyClosingInput } from '../dtos/generate-daily-closing.input';

@Resolver()
export class DailyClosingResolver {
	constructor(private readonly dailyClosingService: DailyClosingService) {}

	@Query(() => ResponseDailyClosing, {
		name: 'dailyClosings',
		description: 'Lista de cierres fiscales',
	})
	@RequirePermissions(Permissions.READ_INVOICING_DAILY_CLOSING)
	findAll(
		@Args({
			name: 'filtersDailyClosing',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de cierres fiscales',
		})
		_: FiltersDailyClosing,
		@Context() context,
	) {
		return this.dailyClosingService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ResponseGenerateDailyClosing, {
		name: 'generateDailyClosing',
		description: 'Genera los cierres diarios',
	})
	@RequirePermissions(Permissions.GENERATE_INVOICING_DAILY_CLOSING)
	generate(
		@Args({
			name: 'generateDailyClosingInput',
			nullable: true,
			defaultValue: {},
			description: 'Datos para crear generar los cierres fiscales',
		})
		_: GenerateDailyClosingInput,
		@Context() context,
	) {
		return this.dailyClosingService.generateDailyClosing(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
