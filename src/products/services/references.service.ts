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
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { Image } from 'src/staticfiles/entities/image.entity';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { ColorsService } from './colors.service';
import { SizesService } from './sizes.service';
import { AttribsService } from './attribs.service';

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
		private readonly brandsService: BrandsService,
		private readonly categoriesService: CategoriesService,
		private readonly warehousesService: WarehousesService,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly attribsService: AttribsService,
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
			active,
		}: FiltersReferencesInput,
		products: boolean,
		companyId?: string,
		user?: Partial<User>,
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
				$search: name,
			};
		}

		if (user?.username !== 'admin' || companyId) {
			filters.companies = {
				$elemMatch: { $eq: new Types.ObjectId(companyId) },
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		const references = await this.referenceModel.paginate(filters, options);
		let responseReferences = [];

		//TODO: falta agregar precio de descuento
		if (products) {
			for (let i = 0; i < references?.docs?.length; i++) {
				const reference = references?.docs[i];
				const products = await this.productModel
					.find({
						reference: reference?._id,
						status: 'active',
					})
					.populate([
						'size',
						{
							path: 'color',
							populate: {
								path: 'image',
								model: Image.name,
							},
						},
						{
							path: 'images',
							model: Image.name,
						},
					]);

				responseReferences.push({
					...reference,
					products,
				});
			}
		} else {
			responseReferences = references?.docs;
		}

		return {
			...references,
			docs: responseReferences,
		};
	}

	async findById(_id: string, user: User, companyId: string) {
		const filters: FilterQuery<Reference> = { _id };

		if (user.username !== 'admin') {
			filters.companies = { $in: new Types.ObjectId(companyId) };
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
		{
			weight,
			width,
			long,
			volume,
			height,
			brandId,
			categoryLevel1Id,
			categoryLevel2Id,
			categoryLevel3Id,
			attribIds,
			combinations,
			...props
		}: CreateReferenceInput,
		user: User,
		companyId: string,
	) {
		const brand = await this.brandsService.findById(brandId);

		if (!brand) {
			throw new NotFoundException('La marca no existe');
		}

		let categoryLevel1;
		if (categoryLevel1Id) {
			categoryLevel1 = await this.categoriesService.findById(
				categoryLevel1Id,
				1,
			);

			if (!categoryLevel1) {
				throw new NotFoundException('La categoría nivel 1 no existe');
			}
		}
		let categoryLevel2;
		if (categoryLevel2Id) {
			categoryLevel2 = await this.categoriesService.findById(
				categoryLevel2Id,
				2,
			);

			if (!categoryLevel2) {
				throw new NotFoundException('La categoría nivel 2 no existe');
			}
		}

		let categoryLevel3;
		if (categoryLevel3Id) {
			categoryLevel3 = await this.categoriesService.findById(
				categoryLevel3Id,
				3,
			);

			if (!categoryLevel3) {
				throw new NotFoundException('La categoría nivel 3 no existe');
			}
		}

		const attribs = [];

		for (let i = 0; i < attribIds.length; i++) {
			const attribId = attribIds[i];
			const attrib = await this.attribsService.findById(attribId);
			if (!attrib) {
				throw new NotFoundException('Atributo no existe');
			}
			attribs.push(attrib._id);
		}

		const reference = new this.referenceModel({
			...props,
			user,
			brand: brand._id,
			categoryLevel1: categoryLevel1?._id,
			categoryLevel2: categoryLevel2?._id,
			categoryLevel3: categoryLevel3?._id,
			attribs,
			shipping: {
				weight,
				width,
				long,
				volume,
				height,
			},
			companies: [new Types.ObjectId(companyId)],
		});
		const responseReference = await reference.save();

		if (responseReference && combinations.length > 0) {
			const warehouses = await this.warehousesService.getAll();

			const stock = warehouses.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 0,
				user,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			const products = await this.productModel.paginate({}, { limit: 0 });

			for (let i = 0; i < combinations.length; i++) {
				const { colorId, sizeId, imageIds } = combinations[i];
				const color = await this.colorsService.findById(colorId);
				if (!color) {
					throw new NotFoundException(
						'La referencia fue creada pero algunos productos tienen un color que no existe',
					);
				}
				const size = await this.sizesService.findById(sizeId);
				if (!size) {
					throw new NotFoundException(
						'La referencia fue creada pero algunos productos tienen una talla que no existe',
					);
				}

				const total = () => {
					const totalData = products.totalDocs + i;
					if (totalData < 10) {
						return `00000${totalData}`;
					}

					if (totalData < 100) {
						return `0000${totalData}`;
					}

					if (totalData < 1000) {
						return `000${totalData}`;
					}

					if (totalData < 10000) {
						return `00${totalData}`;
					}

					if (totalData < 100000) {
						return `0${totalData}`;
					}

					if (totalData < 1000000) {
						return `${totalData}`;
					}
				};

				const barcode = `7700000${total()}`;

				const newProduct = new this.productModel({
					reference: responseReference._id,
					barcode,
					color: color._id,
					size: size._id,
					images: imageIds?.map((id) => new Types.ObjectId(id)) || [],
					user,
					stock,
				});

				await newProduct.save();
			}
		}

		return responseReference;
	}

	async update(
		id: string,
		params: UpdateReferenceInput,
		user: User,
		companyId: string,
	) {
		const reference = await this.referenceModel.findById(id).lean();

		if (!reference) {
			throw new NotFoundException('La referencia no existe');
		}

		const companies = reference.companies.map((company) => company.toString());

		if (user.username !== 'admin' && !companies.includes(companyId)) {
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

	/**
	 * @description se encarga de obtener todas las referencias sin paginación
	 * @param filters filtros para obtener las referencias
	 * @returns referencias
	 */
	async getReferences({ name }: FiltersReferenceInput) {
		const filters: FilterQuery<Reference> = {};

		if (name) {
			filters.$text = {
				$search: `${name}`,
			};
		}

		return this.referenceModel.find(filters).lean();
	}
}
