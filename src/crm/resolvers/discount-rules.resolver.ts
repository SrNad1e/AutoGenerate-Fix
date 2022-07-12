import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateDiscountRuleInput } from '../dtos/create-discount-rule.input';
import { FiltersDiscountRulesInput } from '../dtos/filters-discount-rules.input';
import { ResponseDiscountRules } from '../dtos/response-discount-rules';
import { UpdateDiscountRuleInput } from '../dtos/update-discount-rule.input';
import { DiscountRule } from '../entities/discountRule.entity';
import { DiscountRulesService } from '../services/discount-rules.service';

@Resolver()
export class DiscountRulesResolver {
	constructor(private readonly discountRulesService: DiscountRulesService) {}

	@Query(() => ResponseDiscountRules, {
		name: 'discountRules',
		description: 'Listado de descuentos',
	})
	@RequirePermissions(Permissions.READ_CRM_DISCOUNTRULES)
	findAll(
		@Args({
			name: 'filtersDiscountRulesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar el listado de descuentos',
		})
		_: FiltersDiscountRulesInput,
		@Context() context,
	) {
		return this.discountRulesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => DiscountRule, {
		name: 'createDiscountRule',
		description: 'Se encarga crear un descuento',
	})
	@RequirePermissions(Permissions.CREATE_CRM_DISCOUNTRULE)
	create(
		@Args('createDiscountRuleInput', {
			description: 'Parámetros para crear el descuento',
		})
		_: CreateDiscountRuleInput,
		@Context() context,
	) {
		return this.discountRulesService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => DiscountRule, {
		name: 'updateDiscountRule',
		description: 'Se encarga actualizar un descuento',
	})
	@RequirePermissions(Permissions.UPDATE_CRM_DISCOUNTRULE)
	update(
		@Args('id', { description: 'Identificador del descuento' }) id: string,
		@Args('updateDiscountRuleInput', {
			description: 'Parámetros para actualizar el descuento',
		})
		_: UpdateDiscountRuleInput,
		@Context() context,
	) {
		return this.discountRulesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
