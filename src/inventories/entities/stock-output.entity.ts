/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@Schema({ timestamps: true, collection: 'stockoutput' })
export class StockOutput extends Document {
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Prop({ type: Array, required: true })
	detail: {
		product: Product;
		quantity: number;
	}[];

	@Prop({ type: String, default: 'open' })
	status: string;

	@Prop({ type: Number, required: true })
	total: number;

	@Prop({ type: Number, required: true })
	quantity: number;

	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Prop({ type: String })
	observation: string;
}
export const StockOutputSchema = SchemaFactory.createForClass(StockOutput);
