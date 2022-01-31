/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'bson';
import { Document } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@Schema({ timestamps: true, collection: 'stockrequest' })
export class StockRequest extends Document {
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Prop({ type: String, default: 'open' })
	status: string;

	@Prop({ type: Object, required: true })
	warehouseOrigin: Warehouse;

	@Prop({ type: Array, required: true })
	detail: {
		product: Product;
		quantity: number;
		quantityConfirmed?: number;
		status: string;
		createdAt: Date;
		updateAt: Date;
	}[];

	@Prop({ type: Object, required: true })
	warehouseDestination: Warehouse;

	@Prop({ type: ObjectId })
	transferId?: ObjectId;

	//TODO: pendiente pasar a mongo los usuarios
	@Prop({ type: Number, required: true })
	userIdDestination?: number;

	@Prop({ type: String })
	observationDestination?: string;

	@Prop({ type: String })
	observation?: string;

	//TODO: Eliminar con el tiempo campo de mysql
	@Prop({ type: String })
	code?: string;
}

export const StockRequestSchema = SchemaFactory.createForClass(StockRequest);
