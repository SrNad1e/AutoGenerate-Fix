import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateReferenceInput } from '../dtos/create-reference.input';
import { FiltersReferenceInput } from '../dtos/filters-reference.input';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { UpdateReferenceInput } from '../dtos/update-reference';
import { Attrib } from '../entities/attrib.entity';
import { Brand } from '../entities/brand.entity';
import { CategoryLevel1 } from '../entities/category-level1.entity';
import { CategoryLevel2 } from '../entities/category-level2.entity';
import { CategoryLevel3 } from '../entities/category-level3.entity';
import { Company } from '../../configurations/entities/company.entity';
import { Reference } from '../entities/reference.entity';
import { Product } from '../entities/product.entity';

const populate = [
	{ path: 'brand', model: Brand.name },
	{ path: 'categoryLevel1', model: CategoryLevel1.name },
	{ path: 'categoryLevel2', model: CategoryLevel2.name },
	{ path: 'categoryLevel3', model: CategoryLevel3.name },
	{ path: 'attribs', model: Attrib.name },
	{ path: 'companies', model: Company.name },
];

@Injectable()
export class ReferencesService {
	constructor(
		@InjectModel(Reference.name)
		private readonly referenceModel: PaginateModel<Reference>,
		@InjectModel(Product.name)
		private readonly productModel: PaginateModel<Product>,
	) {}

	async findAll(
		{
			brandId,
			cost,
			limit = 10,
			page = 1,
			name,
			sort,
			price,
			typeDiscount,
			active,
		}: FiltersReferencesInput,
		user: Partial<User>,
	) {
		const filters: FilterQuery<Reference> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (brandId) {
			filters.brand = new Types.ObjectId(brandId);
		}

		if (cost) {
			filters.cost = cost;
		}

		if (price) {
			filters.price = price;
		}

		if (name) {
			filters.$text = {
				$search: `${name}`,
			};
		}

		if (user?.company['_id']) {
			filters.companies = new Types.ObjectId(user?.company['_id']);
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		const references = await this.referenceModel.paginate(filters, options);
		const responseReferences = [];

		//TODO: falta agregar precio de descuento

		for (let i = 0; i < references?.docs?.length; i++) {
			const reference = references?.docs[i];
			const products = await this.productModel
				.find({
					reference: reference?._id,
					status: 'active',
				})
				.populate(['color', 'size']);
			responseReferences.push({
				...reference,
				products,
			});
		}

		return {
			...references,
			docs: responseReferences,
		};
	}

	async findById(_id: string, user: User) {
		const filters: FilterQuery<Reference> = { _id };

		if (user.username !== 'admin') {
			filters.companies === user.company._id;
		}

		const response = await this.referenceModel
			.findOne(filters)
			.populate(populate)
			.lean();
		if (response) {
			return response;
		}
		throw new NotFoundException('La referencia no existe');
	}

	async findOne(params: FiltersReferenceInput) {
		return this.referenceModel.findOne(params).lean();
	}

	async create(
		{ weight, width, long, volume, height, ...props }: CreateReferenceInput,
		user: User,
	) {
		const reference = new this.referenceModel({
			...props,
			user,
			shipping: {
				weight,
				width,
				long,
				volume,
				height,
			},
		});

		return (await reference.save()).populate(populate);
	}

	async update(id: string, params: UpdateReferenceInput, user: User) {
		const reference = await this.referenceModel.findById(id).lean();

		if (!reference) {
			throw new NotFoundException('La referencia no existe');
		}

		if (
			user.username !== 'admin' &&
			!reference.companies.includes(user.company._id)
		) {
			throw new UnauthorizedException(
				'La referencia no está habilitada para la sucursal del usuario',
			);
		}

		return this.referenceModel.findByIdAndUpdate(id, {
			$set: {
				...params,
			},
		});
	}
}
