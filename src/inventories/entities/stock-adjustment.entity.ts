/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@ObjectType()
export class DetailAdjustment {
	@Field(() => Product, { description: 'Producto de la ajuste' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de producto' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del deltalle al ajuste',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del detalle al ajuste',
	})
	updateAt: Date;
}

@Schema({ timestamps: true, collection: 'stockadjustment' })
@ObjectType()
export class StockAdjustment extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => [DetailAdjustment], { description: 'Detalles del ajuste' })
	@Prop({ type: Array, required: true })
	details: DetailAdjustment[];

	@Field(() => String, {
		description: 'Estado del ajuste (open, confirmed, cancelled)',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Number, { description: 'Costo total del ajuste' })
	@Prop({ type: Number, required: true })
	total: number;

	@Field(() => Warehouse, { description: 'Bodega del ajuste' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	@Prop({ type: String })
	observation: string;
}
export const StockAdjustmentSchema =
	SchemaFactory.createForClass(StockAdjustment);
