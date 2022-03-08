import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as SchemaMongo } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@Schema({ timestamps: true })
@ObjectType()
export class StockHistory extends Document {
	@Field(() => String, { description: 'Identificador mongo' })
	_id: Types.ObjectId;

	@Field(() => Warehouse, { description: 'Bodega' })
	@Prop({ type: SchemaMongo.Types.ObjectId, ref: 'Warehouse' })
	warehouse: Types.ObjectId;

	@Field(() => Number, { description: 'Stock del producto en la bodega' })
	@Prop({ types: Number })
	stock: number;

	@Field(() => Product, { description: 'Producto' })
	@Prop({ type: SchemaMongo.Types.ObjectId, ref: 'Product' })
	product: Types.ObjectId;

	@Field(() => Date, { description: 'Fecha de creación del traslado' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
