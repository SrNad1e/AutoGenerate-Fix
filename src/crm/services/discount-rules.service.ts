import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';
import * as dayjs from 'dayjs';

import { User } from 'src/configurations/entities/user.entity';
import { CreateDiscountRuleInput } from '../dtos/create-discount-rule.input';
import { FiltersDiscountRulesInput } from '../dtos/filters-discount-rules.input';
import { FindDiscountInput } from '../dtos/find-discount.input';
import {
	DiscountRule,
	DocumentTypesRule,
	TypesRule,
} from '../entities/discountRule.entity';
import { CustomersService } from './customers.service';

@Injectable()
export class DiscountRulesService {
	constructor(
		@InjectModel(DiscountRule.name)
		private readonly discountRuler: PaginateModel<DiscountRule>,
		private readonly customersService: CustomersService,
	) {}

	async findAllDiscountRulers(
		{
			sort,
			active,
			limit = 10,
			name,
			page = 1,
			percent,
			value,
		}: FiltersDiscountRulesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<DiscountRule> = {};

		if (user.username !== 'admin') {
			filters['rules.documentIds'] = companyId;
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = name;
		}

		if (percent !== undefined) {
			filters.percent = percent;
		}

		if (value !== undefined) {
			filters.value = value;
		}

		const options = {
			lean: true,
			sort,
			limit,
			page,
		};

		return this.discountRuler.paginate(filters, options);
	}

	async create(
		{
			dateFinal,
			dateInitial,
			name,
			rules,
			percent = 0,
			value = 0,
		}: CreateDiscountRuleInput,
		user: User,
		companyId: string,
	) {
		if (!dayjs(dateInitial).isBefore(dayjs(dateFinal))) {
			throw new BadRequestException(
				'La fecha final debe ser posterior a la fecha inicial',
			);
		}

		if (value < 0 || percent < 0) {
			throw new BadRequestException('El descuento no puede ser negativo');
		}

		if (value > 0 && percent > 0) {
			throw new BadRequestException(
				'Solo debe enviar un descuento ya sea en porcentaje o valor',
			);
		}

		const newRules = rules;

		newRules.push({
			documentType: DocumentTypesRule.COMPANY,
			documentIds: [companyId],
			type: TypesRule.EQUAL,
		});

		return this.discountRuler.create({
			name,
			rules: newRules,
			dateInitial: new Date(dateInitial),
			dateFinal: new Date(dateFinal),
			percent,
			value,
			user,
		});
	}

	async update() {}

	/**
	 * @description obtiene el descuento del producto a evaluar
	 * @param params datos para evaluar las reglas
	 * @returns valor del descuento
	 */
	async getDiscount({ customerId, reference, companyId }: FindDiscountInput) {
		const discountRulers = await this.discountRuler.find({
			dateInitial: {
				$gt: new Date(),
			},
			dateFinal: {
				$lte: new Date(),
			},
			active: true,
		});

		if (discountRulers.length > 0) {
			const customer = await this.customersService.findById(customerId);
			for (let j = 0; j < discountRulers.length; j++) {
				const { value, percent, rules } = discountRulers[j];

				let pass = false;
				if (!pass) {
					for (let i = 0; i < rules?.length; i++) {
						const { documentType, documentIds } = rules[i];
						switch (documentType) {
							case DocumentTypesRule.CUSTOMERTYPES:
								if (
									!documentIds.includes(customer?.customerType?._id?.toString())
								) {
									pass = false;
									i = rules?.length;
								} else {
									pass = true;
								}
								break;
							case DocumentTypesRule.CATEGORIES:
								if (
									!(
										documentIds.includes(
											reference?.categoryLevel1?._id?.toString(),
										) ||
										documentIds.includes(
											reference?.categoryLevel2?._id?.toString(),
										) ||
										documentIds.includes(
											reference?.categoryLevel3?._id.toString(),
										)
									)
								) {
									pass = false;
									i = rules?.length;
								} else {
									pass = true;
								}

								break;

							case DocumentTypesRule.COMPANY:
								if (!documentIds.includes(companyId)) {
									pass = false;
									i = rules?.length;
								} else {
									pass = true;
								}
								break;
							default:
								break;
						}
					}
					if (pass) {
						if (value > 0) {
							return value;
						}

						if (percent > 0) {
							return (percent * reference.price) / 100;
						}
					}
				}
			}
		}

		return 0;
	}
}
