import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Image } from 'src/images/entities/image.entity';
import { Color } from './color.entity';
import { Provider } from './provider.entity';
import { Size } from './size.entity';
import { User } from 'src/users/entities/user.entity';
import { Shipping } from './shipping.entity';

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

	@Field(() => Color, { description: 'Color del producto' })
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Color.name,
		autopopulate: true,
		required: true,
	})
	color: mongoose.Schema.Types.ObjectId;

	@Field(() => Size, { description: 'Talla del producto' })
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Size.name,
		autopopulate: true,
		required: true,
	})
	size: mongoose.Schema.Types.ObjectId;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Provider.name,
		autopopulate: true,
		required: true,
	})
	@Field(() => Provider, { description: 'Fabricante del producto' })
	provider: mongoose.Schema.Types.ObjectId;

	/*@Field(() => [Category], { description: 'Categorías del producto' })
	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		ref: Category.name,
		autopopulate: true,
		required: true,
	})
	categories: mongoose.Schema.Types.ObjectId[];*/

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Costo del producto' })
	cost: number;

	@Prop({ type: String, default: 'Active' })
	@Field(() => String, { description: 'Estado del producto' })
	state: string;

	/*@Prop({ type: Array, default: [] })
	@Field(() => [Image], { description: 'Imagenes del producto' })
	images: Image[];*/

	@Prop({ type: User, required: true })
	@Field(() => User, { description: 'Usuario que crea el producto' })
	user: User;

	@Prop({
		type: Object,
		default: {
			width: 0,
			height: 0,
			long: 0,
			weight: 0,
			volume: 0,
		},
	})
	@Field(() => Shipping, { description: 'Medidas del producto' })
	shipping: Shipping;

	//TODO: campo a evaluar
	/*@Prop({ type: String })
	type: string;*/

	//TODO: campo de mysql
	@Prop({ type: Number, unique: true })
	@Field(() => Number, {
		description: 'Identificador de mysql',
		nullable: true,
		deprecationReason: 'Id de mysql',
	})
	id: number;
}
export const ProductSchema = SchemaFactory.createForClass(Product);

@Entity({ name: 'products' })
export class ProductMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	provider_id: number;

	@Column({ type: 'int' })
	size_id: number;

	@Column({ type: 'int' })
	color_id: number;

	@Column({ type: 'int' })
	owner_user_id: number;

	@Column({ type: 'varchar' })
	reference: string;

	@Column({ type: 'varchar' })
	barcode: string;

	@Column({ type: 'double' })
	price: number;

	@Column({ type: 'double' })
	cost: number;

	@Column({ type: 'tinyint' })
	state: boolean;

	@Column({ type: 'varchar' })
	description: string;

	@Column({ type: 'tinyint' })
	changeable: boolean;

	@Column({ type: 'varchar' })
	images: string;

	@Column({ type: 'double' })
	shipping_width: number;

	@Column({ type: 'double' })
	shipping_long: number;

	@Column({ type: 'double' })
	shipping_height: number;

	@Column({ type: 'double' })
	shipping_weight: number;

	@Column({ type: 'double' })
	shipping_volume: number;
}
