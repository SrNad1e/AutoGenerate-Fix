import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document, Schema as SchemaMongo } from 'mongoose';

import { Color } from './color.entity';
import { Size } from './size.entity';
import { Reference } from './reference.entity';
import { Image } from 'src/configurations/entities/image.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

export enum StatusProduct {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

registerEnumType(StatusProduct, { name: 'StatusProduct' });

@ObjectType({ description: 'Inventario por bodegas del producto' })
export class Stock {
	@Field(() => Warehouse, { description: 'Identificador de la bodega' })
	warehouse: Types.ObjectId;

	@Field(() => Number, { description: 'Cantidad de productos en la bodega' })
	quantity: number;

	@Field(() => User, { description: 'Usuario que crea los datos de envío' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación del dato de envio' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del dato de envio',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true })
@ObjectType({ description: 'Productos del sistema' })
export class Product extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({
		type: SchemaMongo.Types.ObjectId,
		ref: Reference.name,
		autopopulate: true,
		required: true,
	})
	@Field(() => Reference, { description: 'Referencia del producto' })
	reference: Types.ObjectId;

	@Prop({ type: String, unique: true })
	@Field(() => String, { description: 'Código de barras del producto' })
	barcode: string;

	@Field(() => Color, { description: 'Color del producto' })
	@Prop({
		type: SchemaMongo.Types.ObjectId,
		ref: Color.name,
		autopopulate: true,
		required: true,
	})
	color: Types.ObjectId;

	@Field(() => [Image], {
		description: 'Imagenes del producto',
		nullable: true,
	})
	@Prop({
		type: [SchemaMongo.Types.ObjectId],
		ref: Image.name,
		autopopulate: true,
		default: [],
	})
	images: Types.ObjectId[];

	@Field(() => Size, { description: 'Talla del producto' })
	@Prop({
		type: SchemaMongo.Types.ObjectId,
		ref: Size.name,
		autopopulate: true,
		required: true,
	})
	size: Types.ObjectId;

	@Prop({ type: String, default: 'active' })
	@Field(() => StatusProduct, {
		description: 'Estado del producto',
	})
	status: StatusProduct;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea el producto' })
	user: User;

	@Prop({ type: Array, default: [] })
	@Field(() => [Stock], {
		description: 'Inventario del producto por bodegas',
		nullable: true,
	})
	stock?: Stock[];

	@Field(() => Date, { description: 'Fecha de creación del producto' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del producto',
	})
	updatedAt: Date;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
/*
@Entity({ name: 'products' })
export class ProductMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	provider_id: number;

	@Column({ type: 'int' })
	size_id: number;

	@Column({ type: 'int' })
	category_id: number;

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
}*/
