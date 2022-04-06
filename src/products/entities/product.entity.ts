import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document, Schema as SchemaMongo } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Color } from './color.entity';
import { Provider } from './provider.entity';
import { Size } from './size.entity';
import { User } from 'src/users/entities/user.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@ObjectType()
export class Shipping {
	@Field(() => Number, { description: 'Ancho del producto' })
	width: number;

	@Field(() => Number, { description: 'Alto del producto' })
	height: number;

	@Field(() => Number, { description: 'Largo del producto' })
	long: number;

	@Field(() => Number, { description: 'Peso del producto' })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto' })
	volume: number;
}

@ObjectType()
export class Stock {
	@Field(() => Warehouse, { description: 'Identificador de la bodega' })
	warehouse: Types.ObjectId;

	@Field(() => Number, { description: 'Cantidad de productos en la bodega' })
	quantity: number;
}

@ObjectType()
export class MaxMin {
	@Field(() => Warehouse, { description: 'Identificador de la bodega' })
	warehouse: Types.ObjectId;

	@Field(() => Number, {
		description: 'Cantidad máxima de productose en la bodega',
	})
	max: number;

	@Field(() => Number, {
		description: 'Cantidad mínima de productos en la bodega',
	})
	min: number;
}

@Schema({ timestamps: true })
@ObjectType()
export class Product extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true, index:'text' })
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
		type: SchemaMongo.Types.ObjectId,
		ref: Color.name,
		autopopulate: true,
		required: true,
	})
	color: Types.ObjectId;

	@Field(() => Size, { description: 'Talla del producto' })
	@Prop({
		type: SchemaMongo.Types.ObjectId,
		ref: Size.name,
		autopopulate: true,
		required: true,
	})
	size: Types.ObjectId;

	@Prop({
		type: SchemaMongo.Types.ObjectId,
		ref: Provider.name,
		autopopulate: true,
		required: true,
	})
	@Field(() => Provider, { description: 'Fabricante del producto' })
	provider: Types.ObjectId;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Costo del producto' })
	cost: number;

	@Prop({ type: String, default: 'Active' })
	@Field(() => String, { description: 'Estado del producto' })
	status: string;

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

	@Prop({ type: Array })
	@Field(() => [Stock], { description: 'Inventario del producto por bodegas' })
	stock: Stock[];

	//TODO: campo de mysql
	@Prop({ type: Number, unique: true })
	@Field(() => Number, {
		description: 'Identificador de mysql',
		deprecationReason: 'Campo para migración de mysql',
		nullable: true,
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
