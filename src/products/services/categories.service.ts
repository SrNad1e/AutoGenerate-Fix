import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateCategoryInput } from '../dtos/create-category.input';
import { FiltersCategoriesLevelInput } from '../dtos/filters-categories-level.input';
import { FiltersCategoriesInput } from '../dtos/filters-categories.input';
import { UpdateCategoryInput } from '../dtos/update-category.input';
import { CategoryLevel1 } from '../entities/category-level1.entity';
import { CategoryLevel2 } from '../entities/category-level2.entity';
import { CategoryLevel3 } from '../entities/category-level3.entity';

const populate = [
	{
		path: 'childs',
		model: CategoryLevel2.name,
	},
	{
		path: 'childs',
		populate: { path: 'childs', model: CategoryLevel3.name },
	},
];

@Injectable()
export class CategoriesService {
	constructor(
		@InjectModel(CategoryLevel1.name)
		private readonly categoryLevel1Model: PaginateModel<CategoryLevel1>,
		@InjectModel(CategoryLevel2.name)
		private readonly categoryLevel2Model: PaginateModel<CategoryLevel2>,
		@InjectModel(CategoryLevel3.name)
		private readonly categoryLevel3Model: PaginateModel<CategoryLevel3>,
	) {}

	async findAll({ name, limit = 10, page = 1, sort }: FiltersCategoriesInput) {
		const filters: FilterQuery<CategoryLevel1> = {};
		if (name) {
			filters.name = { $regex: name, $options: 'i' };

			const filtersLevel2: FilterQuery<CategoryLevel1> = {};

			const categoryLevel3 = await this.categoryLevel3Model.find({
				name: { $regex: name, $options: 'i' },
			});

			if (categoryLevel3.length > 0) {
				filtersLevel2.$or = [
					{ childs: { $in: categoryLevel3.map((item) => item._id) } },
					{ name: { $regex: name, $options: 'i' } },
				];
			}

			const categoryLevel2 = await this.categoryLevel2Model.find(filtersLevel2);

			if (categoryLevel2.length > 0) {
				filters.$or = [
					{ childs: { $in: categoryLevel2.map((item) => item._id) } },
					{ name: { $regex: name, $options: 'i' } },
				];

				delete filters.name;
			}
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
			populate,
		};

		return this.categoryLevel1Model.paginate(filters, options);
	}

	async findAllLevel({
		level,
		name,
		sort,
		limit = 10,
		page = 1,
	}: FiltersCategoriesLevelInput) {
		const filters: FilterQuery<CategoryLevel1> = {};

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
		};

		switch (level) {
			case 1:
				return this.categoryLevel1Model.paginate(filters, options);
			case 2:
				return this.categoryLevel2Model.paginate(filters, options);
			case 3:
				return this.categoryLevel3Model.paginate(filters, options);
			default:
				throw new NotFoundException('El nivel de categoría no existe');
		}
	}

	async findById(_id: string, level: number) {
		switch (level) {
			case 1:
				return this.categoryLevel1Model.findById(_id).lean();
			case 2:
				return this.categoryLevel2Model.findById(_id).lean();
			case 3:
				return this.categoryLevel3Model.findById(_id).lean();
			default:
				break;
		}
	}

	async create(
		{ name, level, parentId }: CreateCategoryInput,
		user: Partial<User>,
	) {
		if (level === 1) {
			const category = await this.categoryLevel1Model.findOne({ name });
			if (category) {
				throw new NotFoundException(
					`El nombre ${name} ya ha sido asignado a una categoría`,
				);
			}
			const newCategory = new this.categoryLevel1Model({
				name,
				user,
			});
			return (await newCategory.save()).populate(populate);
		}

		if (level === 2) {
			const categoryParent = await this.findById(parentId, 1);

			if (!categoryParent) {
				throw new NotFoundException('La categoría padre no existe');
			}

			const category = await this.categoryLevel2Model.findOne({ name });
			const childs = categoryParent['childs'].map((child) => child.toString());

			if (category && childs.includes(category?._id.toString())) {
				throw new NotFoundException(
					`El nombre ${name} ya ha sido asignado a una categoría`,
				);
			}

			const newCategory = new this.categoryLevel2Model({
				name,
				parentId: categoryParent._id,
				user,
			});
			const response = await newCategory.save();

			return this.update(
				response._id.toString(),
				{
					level: 2,
					parentId,
				},
				user,
			);
		}

		if (level === 3) {
			const categoryParent = await this.findById(parentId, 2);

			if (!categoryParent) {
				throw new NotFoundException('La categoría padre no existe');
			}

			const category = await this.categoryLevel3Model.findOne({ name });
			const childs = categoryParent['childs'].map((child) => child.toString());

			if (category && childs.includes(category._id.toString())) {
				throw new NotFoundException(
					`El nombre ${name} ya ha sido asignado a una categoría`,
				);
			}

			const newCategory = new this.categoryLevel3Model({
				name,
				parentId: categoryParent._id,
				user,
			});
			const response = await newCategory.save();

			return this.update(
				response._id.toString(),
				{
					level: 3,
					parentId,
				},
				user,
			);
		}
	}

	async update(
		id: string,
		{ level, parentId, name }: UpdateCategoryInput,
		user: Partial<User>,
	) {
		if (level === 1) {
			const categoryLevel1 = await this.findById(id, level);

			if (!categoryLevel1) {
				throw new NotFoundException('La categoría nivel 1 no existe');
			}

			if (name) {
				const categoryName = await this.categoryLevel1Model.findOne({ name });
				if (categoryName && categoryLevel1._id !== categoryName._id) {
					throw new NotFoundException(
						'El nombre ya esta asignado a una categoría',
					);
				}
				return this.categoryLevel1Model.findByIdAndUpdate(
					id,
					{
						$set: {
							name,
							user,
						},
					},
					{
						populate,
						new: true,
						lean: true,
					},
				);
			}
			throw new NotFoundException('No hay cambios a realizar');
		}

		if (level === 2) {
			const categoryLevel2 = await this.findById(id, level);

			if (!categoryLevel2) {
				throw new NotFoundException('La categoría nivel 2 no existe');
			}

			let categoryParent;

			if (parentId) {
				categoryParent = await this.findById(parentId, 1);
				if (!categoryParent) {
					throw new NotFoundException(
						'La categoría a la que piensa asiganarla no existe',
					);
				}
			}

			if (name) {
				const categoryName = await this.categoryLevel2Model.findOne({ name });
				if (categoryName && categoryLevel2._id !== categoryName._id) {
					throw new NotFoundException(
						'El nombre ya esta asignado a una categoría',
					);
				}

				await this.categoryLevel2Model.findByIdAndUpdate(id, {
					$set: {
						name,
						parentId: categoryParent?._id,
						user,
					},
				});
			}

			if (parentId) {
				const categoryFind = await this.categoryLevel1Model.findOne({
					childs: {
						$elemMatch: { $eq: new Types.ObjectId(id) },
					},
				});

				if (categoryFind) {
					await this.categoryLevel1Model.findByIdAndUpdate(
						categoryFind._id,
						{
							$set: {
								childs: categoryFind['childs'].filter(
									(child) => child.toString() !== id,
								),
								user,
							},
						},
						{
							lean: true,
							populate,
							new: true,
						},
					);
				}

				return this.categoryLevel1Model.findByIdAndUpdate(
					parentId,
					{
						$set: {
							childs: categoryParent['childs'].concat(new Types.ObjectId(id)),
							user,
						},
					},
					{
						lean: true,
						populate,
						new: true,
					},
				);
			}

			return this.categoryLevel1Model
				.findOne({
					childs: {
						$elemMatch: { $eq: new Types.ObjectId(id) },
					},
				})
				.populate(populate)
				.lean();
		}

		if (level === 3) {
			const categoryLevel3 = await this.findById(id, level);

			if (!categoryLevel3) {
				throw new NotFoundException('La categoría nivel 3 no existe');
			}

			let categoryParent;
			if (parentId) {
				categoryParent = await this.findById(parentId, 2);
				if (!categoryParent) {
					throw new NotFoundException(
						'La categoría a la que piensa asiganarla no existe',
					);
				}
			}

			if (name) {
				const categoryName = await this.categoryLevel3Model.findOne({ name });

				if (categoryName && categoryLevel3._id !== categoryName._id) {
					throw new NotFoundException(
						'El nombre ya esta asignado a una categoría',
					);
				}

				await this.categoryLevel3Model.findByIdAndUpdate(id, {
					$set: {
						name,
						parentId: categoryParent?._id,
						user,
					},
				});
			}

			if (parentId) {
				const categoryFind = await this.categoryLevel2Model.findOne({
					childs: {
						$elemMatch: { $eq: new Types.ObjectId(id) },
					},
				});

				if (categoryFind) {
					await this.categoryLevel3Model.findByIdAndUpdate(
						categoryFind._id,
						{
							$set: {
								childs: categoryFind['childs'].filter(
									(child) => child.toString() !== id,
								),
								user,
							},
						},
						{
							lean: true,
							new: true,
						},
					);
				}

				await this.categoryLevel2Model.findByIdAndUpdate(
					parentId,
					{
						$set: {
							childs: categoryParent['childs'].concat(new Types.ObjectId(id)),
							user,
						},
					},
					{
						lean: true,
						new: true,
					},
				);
			}

			const responseLevel2 = await this.categoryLevel2Model.findOne({
				childs: {
					$elemMatch: { $eq: new Types.ObjectId(id) },
				},
			});

			return this.categoryLevel1Model
				.findOne({
					childs: {
						$elemMatch: { $eq: responseLevel2._id },
					},
				})
				.populate(populate)
				.lean();
		}

		throw new NotFoundException(`Nivel ${level} no existe`);
	}
}
