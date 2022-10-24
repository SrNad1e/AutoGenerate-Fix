import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersGoalStatusInput } from '../dtos/filters-goal-status.input';
import { ResponseGoalStatus } from '../dtos/response-goal-status';
import { GoalService } from '../services/goal.service';

@Resolver()
export class GoalResolver {
	constructor(private readonly goalService: GoalService) {}

	@Query(() => ResponseGoalStatus, {
		name: 'goalStatus',
		description: 'Consulta usada para ver el estado de la meta',
	})
	@RequirePermissions(Permissions.REPORT_INVOICING_GOAL_STATUS)
	getGoalStatus(
		@Args({
			name: 'filtersGoalStatus',
			description: 'Filtros para obtener el stado de la meta',
		})
		_: FiltersGoalStatusInput,
		@Context() context,
	) {
		return this.goalService.getGoalStatus(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
