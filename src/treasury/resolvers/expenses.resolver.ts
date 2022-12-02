import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateExpenseInput } from '../dtos/create-expense.input';
import { FiltersExpensesInput } from '../dtos/filters-expenses.input';
import { ResponseExpenses } from '../dtos/response-expenses.input';
import { UpdateExpenseInput } from '../dtos/update-expense.input';
import { Expense } from '../entities/expense.entity';
import { ExpensesService } from '../services/expenses.service';

@Resolver()
export class ExpensesResolver {
	constructor(private readonly expensesService: ExpensesService) {}

	@Query(() => ResponseExpenses, {
		name: 'expenses',
		description: 'Se encarga de listar los egresos',
	})
	@RequirePermissions(Permissions.READ_TREASURY_EXPENSES)
	findAll(
		@Args({
			name: 'filtersExpensesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar los egresos',
		})
		_: FiltersExpensesInput,
		@Context() context,
	) {
		return this.expensesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Expense, {
		name: 'createExpense',
		description: 'Crea un egreso',
	})
	@RequirePermissions(Permissions.CREATE_TREASURY_EXPENSE)
	create(
		@Args('createExpenseInput', {
			description: 'Datos para la creación del egreso',
		})
		_: CreateExpenseInput,
		@Context() context,
	) {
		return this.expensesService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Expense, {
		name: 'updateExpense',
		description: 'Actualiza un egreso',
	})
	@RequirePermissions(Permissions.UPDATE_TREASURY_EXPENSE)
	update(
		@Args('id', {
			description: 'Identificador del egreso',
		})
		id: string,
		@Args('updateExpenseInput', {
			description: 'Datos para actualizar el egreso',
		})
		_: UpdateExpenseInput,
		@Context() context,
	) {
		return this.expensesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
