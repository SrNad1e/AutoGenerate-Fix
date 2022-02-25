/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model, ObjectId } from 'mongoose';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.migration.entity';

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name) private productModel: Model<Product>,
		@InjectRepository(ProductMysql)
		private productRepo: Repository<ProductMysql>,
	) {}

	/**
	 * @description obtiene el producto con base al id de mysql
	 * @param id identificador del producto en mysql
	 */
	async getProductsIdSql(ids: ObjectId[]) {
		return await this.productModel.find({ id: { $in: ids } });
	}

	async migration() {
		const products = await this.productRepo
			.query(`SELECT p.reference AS reference, p.description AS description,
		p.barcode AS barcode, p.changeable AS changeable,
		c.name AS "color.name", c.id AS "color.id", c.html AS "color.html",
		c.name_internal AS "color.nameInternal", c.image AS "color.image",
		s.id AS "size.id", s.value AS "size.value", pr.id AS "provider.id",
		pr.name AS "provider.name", p.categories AS categories, p.price AS price,
		p.cost AS cost, p.state AS state,p.images as images, p.owner_user_id AS userId,
		p.shipping_width AS "shipping.width", p.shipping_height AS "shipping.height",
		p.shipping_long AS "shipping.long", p.shipping_weight AS "shipping.weight",
		p.shipping_volume AS "shipping.volume", p.type AS type, p.id AS id
		FROM products p, colors c, sizes s, providers pr
		WHERE p.color_id = c.id AND s.id = p.size_id AND p.provider_id = pr.id`);
		let ok;
		for (let i = 0; i < products.length; i++) {
			try {
				const productData = products[i];
				const product = {
					reference: productData.reference,
					description: productData.description,
					barcode: productData.barcode,
					changeable: productData.changeable,
					color: {
						name: productData['color.name'],
						nameInternal: productData['color.nameInternal'],
						active: productData['color.active'],
						html: productData['color.html'],
						image: JSON.parse(productData['color.image']),
						id: productData['color.id'],
					},
					size: {
						id: productData['size.id'],
						value: productData['size.value'],
						active: productData['size.active'],
					},
					provider: {
						name: productData['provider.name'],
						id: productData['provider.id'],
					},
					shipping: {
						width: parseFloat(productData['shipping.width']),
						height: parseFloat(productData['shipping.height']),
						long: parseFloat(productData['shipping.long']),
						weight: parseFloat(productData['shipping.weight']),
						volume: parseFloat(productData['shipping.volume']),
					},
					categories: productData.categories,
					price: parseInt(productData.price),
					cost: parseInt(productData.cost),
					state: productData.state === '1' ? 'active' : 'inactive',
					images: JSON.parse(productData.images) || [],
					userId: productData.userId,
					id: productData.id,
				};
				await this.productModel.create(product);

				ok = true;
			} catch (e) {
				ok = e;
			}
		}
		if (ok === true) {
			return {
				message: 'Migración correcta',
			};
		}
		return new NotFoundException(ok);
	}
}
