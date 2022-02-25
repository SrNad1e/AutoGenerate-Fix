/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Image } from 'src/images/entities/image.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { Category } from './category.entity';
import { Color } from './color.entity';
import { Provider } from './provider.entity';
import { Size } from './size.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Product extends mongoose.Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: mongoose.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Referencia del producto' })
	reference: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Descripción del producto' })
	description: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Código de barras del producto' })
	barcode: string;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Determina si el producto se puede cambiar',
	})
	changeable: boolean;

	@Prop({ type: Object, required: true })
	@Field(() => Color, { description: 'Color del producto' })
	color: Color;

	@Prop({ type: Object, required: true })
	@Field(() => Size, { description: 'Talla del producto' })
	size: Size;

	@Prop({ type: Object, required: true })
	@Field(() => Provider, { description: 'Fabricante del producto' })
	provider: Provider;

	@Prop({ type: Array, required: true })
	@Field(() => [Category], { description: 'Categorías del producto' })
	categories: Category[];

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Costo del producto' })
	cost: number;

	@Prop({ type: String, default: 'Active' })
	@Field(() => String, { description: 'Estado del producto' })
	state: string;

	@Prop({ type: Array, default: [] })
	@Field(() => [Image], { description: 'Imagenes del producto' })
	images: Image[];

	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
	@Field(() => String, { description: 'Usuario que crea el producto' })
	userId: mongoose.Schema.Types.ObjectId;

	@Prop({ type: Object, required: true })
	@Field(() => [Shipping], { description: 'Características para el envío' })
	shipping: Shipping;

	//TODO: campo a evaluar
	@Prop({ type: String })
	type: string;
}
export const ProductSchema = SchemaFactory.createForClass(Product);


export class ProductOrder extends Product {
	quantity: number;
	@Prop({ type: Object, default: [] })
	returns: {
		createdAt: Date;
		returnType: string;
		quantityReturn: number;
	}[];

	returnType?: string;
	//TODO: eliminar campo al organizar
	salePriceUnit?: number;
	//TODO: campo generico pendiente eliminarlo
	product_id?: number;
}

export class ProductTransfer extends ProductOrder {
	quantity: number;
}


