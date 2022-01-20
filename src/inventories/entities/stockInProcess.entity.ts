/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'bson';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'stockinprocess' })
export class StockInProcess extends Document {
	@Prop({ type: String, required: true })
	documentType: string;

	@Prop({ type: ObjectId })
	documentId: ObjectId;

	@Prop({ type: ObjectId, required: true })
	productId: ObjectId;

	@Prop({ type: ObjectId, required: true })
	warehouseId: ObjectId;

	@Prop({ type: Number, required: true })
	cost: number;

	@Prop({ type: Number, required: true })
	quantity: number;

	@Prop({ type: String, default: 'active' })
	status: string;
}

export const StockInProcessSchema =
	SchemaFactory.createForClass(StockInProcess);
