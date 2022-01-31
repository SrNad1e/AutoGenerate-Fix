/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@Schema({ timestamps: true, collection: 'stockinput' })
export class StockInput extends Document {
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Prop({ type: Array, required: true })
	detail: {
		product: Product;
		quantity: number;
		createdAt: Date;
		updateAt: Date;
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

	@Prop({ type: Object, required: true })
	user: User;
}
export const StockInputSchema = SchemaFactory.createForClass(StockInput);
