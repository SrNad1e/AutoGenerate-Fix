import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

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
import { Product, StatusProduct } from '../entities/product.entity';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { Image } from 'src/configurations/entities/image.entity';
import { ColorsService } from './colors.service';
import { SizesService } from './sizes.service';
import { AttribsService } from './attribs.service';
import { User } from 'src/configurations/entities/user.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';
import { DiscountRulesService } from 'src/crm/services/discount-rules.service';

const populate = [
	{ path: 'brand', model: Brand.name },
	{ path: 'categoryLevel1', model: CategoryLevel1.name },
	{
		path: 'categoryLevel1',
		populate: {
			path: 'childs',
			model: CategoryLevel2.name,
		},
	},
	{
		path: 'categoryLevel1',
		populate: {
			path: 'childs',
			populate: {
				path: 'childs',
				model: CategoryLevel3.name,
			},
		},
	},
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
		private readonly discountRulesService: DiscountRulesService,
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
			changeable,
			customerId,
		}: FiltersReferencesInput,
		products: boolean,
		companyId: string,
	) {
		const filters: FilterQuery<Reference> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (changeable !== undefined) {
			filters.changeable = changeable;
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

		if (companyId) {
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

		if (products) {
			for (let i = 0; i < references?.docs?.length; i++) {
				const reference = references?.docs[i];
				const products = await this.productModel
					.find({
						reference: reference?._id,
						status: StatusProduct.ACTIVE,
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
				let discount = 0;
				if (customerId) {
					discount = await this.discountRulesService.getDiscount({
						customerId,
						reference,
						companyId,
					});
				}
				responseReferences.push({
					...reference,
					products,
					discountPrice: reference?.price - discount,
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

	async findById(_id: string, productsStatus?: string) {
		const filters: FilterQuery<Reference> = { _id };

		const reference = await this.referenceModel
			.findOne(filters)
			.populate(populate)
			.lean();
		if (!reference) {
			throw new NotFoundException('La referencia no existe');
		}

		const filtersProduct: FilterQuery<Product> = { reference: reference?._id };

		if (productsStatus) {
			filtersProduct.status = StatusProduct[productsStatus];
		}

		const products = await this.productModel.find(filtersProduct).populate([
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

		return {
			...reference,
			products,
		};
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

		for (let i = 0; i < attribIds?.length; i++) {
			const attribId = attribIds[i];
			const attrib = await this.attribsService.findById(attribId);
			if (!attrib) {
				throw new NotFoundException('Atributo no existe');
			}
			attribs.push(attrib._id);
		}

		const reference = new this.referenceModel({
			...props,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
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
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			companies: [new Types.ObjectId(companyId)],
		});
		const responseReference = await reference.save();

		if (responseReference && combinations?.length > 0) {
			const warehouses = await this.warehousesService.getAll();

			const stock = warehouses.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 0,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			const products = await this.productModel.paginate({}, { limit: 0 });

			for (let i = 0; i < combinations?.length; i++) {
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

				const total = (quantity = 0) => {
					const totalData = products.totalDocs + i + quantity;
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

				let productFind = true;
				let r = 0;

				let barcode;
				do {
					barcode = `7700000${total(r)}`;
					productFind = !!(await this.productModel.findOne({ barcode }));
					r++;
				} while (productFind);

				const newProduct = new this.productModel({
					reference: responseReference._id,
					barcode,
					color: color._id,
					size: size._id,
					images: imageIds?.map((id) => new Types.ObjectId(id)) || [],
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
					stock,
				});

				await newProduct.save();
			}
		}

		return responseReference;
	}

	async update(
		id: string,
		{
			categoryLevel1Id,
			attribIds,
			categoryLevel2Id,
			categoryLevel3Id,
			brandId,
			height,
			long,
			volume,
			weight,
			width,
			...params
		}: UpdateReferenceInput,
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

		const attribs: any = [];
		if (attribIds) {
			for (let i = 0; i < attribIds?.length; i++) {
				const attribId = attribIds[i];

				const attrib = await this.attribsService.findById(attribId);

				if (!attrib) {
					throw new NotFoundException('Uno de los atributos no existe');
				}

				attribs.push(attrib._id);
			}
		}

		let brand;
		if (brandId) {
			brand = await this.brandsService.findById(brandId);
			if (!brand) {
				throw new NotFoundException('La marca no existe');
			}
		}

		let shipping;

		if (height || long || volume || weight || width) {
			shipping = {
				...reference.shipping,
				height,
				long,
				volume,
				weight,
				width,
			};
		}

		return this.referenceModel.findByIdAndUpdate(
			id,
			{
				$set: {
					categoryLevel1: categoryLevel1?._id,
					categoryLevel2: categoryLevel2?._id || null,
					categoryLevel3: categoryLevel3?._id || null,
					attribs,
					brand: brand?._id,
					shipping,
					...params,
				},
			},
			{
				lean: true,
				populate,
				new: true,
			},
		);
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
