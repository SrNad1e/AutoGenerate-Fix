/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';

import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { StockRequest } from 'src/stock-request/entities/stock-request.entity';

@Schema({ timestamps: true, collection: 'stocktransfer' })
export class StockTransfer extends Document {
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Prop({ type: String, default: 'open' })
	status: string;

	@Prop({ type: Object, required: true })
	warehouseOrigin: Warehouse;

	//TODO: pendiente pasar a mongo los usuarios
	@Prop({ type: Number, required: true })
	userIdOrigin: number;

	@Prop({ type: Array, required: true })
	detail: {
		product: Product;
		quantity: number;
		quantityConfirmed?: number;
		status: string;
		createdAt: Date;
		updateAt: Date;
	}[];

	@Prop({ type: String })
	observationOrigin?: string;

	@Prop({ type: Object, required: true })
	warehouseDestination: Warehouse;

	//TODO: pendiente pasar a mongo los usuarios
	@Prop({ type: Number })
	userIdDestination?: number;

	@Prop({ type: String })
	observationDestination?: string;

	@Prop({ type: String })
	observation?: string;

	@Prop({ type: Array, default: [] })
	requests: StockRequest[];

	@Prop({ type: String })
	code?: string;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
