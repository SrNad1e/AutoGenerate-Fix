import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { FindDiscountInput } from '../dtos/find-discount.input';
import {
	DiscountRuler,
	DocumentTypesRuler,
} from '../entities/discountRuler.entity';
import { CustomersService } from './customers.service';

@Injectable()
export class DiscountRulersService {
	constructor(
		@InjectModel(DiscountRuler.name)
		private readonly discountRuler: PaginateModel<DiscountRuler>,
		private readonly customersService: CustomersService,
	) {}

	async getDiscountProduct({ customerId, product }: FindDiscountInput) {
		const discountRulers = await this.discountRuler.find({
			dateInitial: {
				$gt: new Date(),
			},
			dateFinal: {
				$lte: new Date(),
			},
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
							case DocumentTypesRuler.CUSTOMERTYPES:
								if (
									!documentIds.includes(customer?.customerType?._id?.toString())
								) {
									pass = false;
									i = rules?.length;
								} else {
									pass = true;
								}
								break;
							case DocumentTypesRuler.CATEGORIES:
								if (
									!(
										documentIds.includes(
											product?.reference['categoryLevel1']?.toString(),
										) ||
										documentIds.includes(
											product?.reference['categoryLevel2']?.toString(),
										) ||
										documentIds.includes(
											product?.reference['categoryLevel3']?.toString(),
										)
									)
								) {
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
							return (percent * product?.reference['price']) / 100;
						}
					}
				}
			}
		}

		return 0;
	}
}
