import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Color } from './color.entity';
import { Size } from './size.entity';

@Schema({ timestamps: true })
export class Product extends Document {
	salePriceUnit: number;
	quantity: number;
	reference: string;
	returnType: string;
	changeable: boolean;
	color: Color;
	size: Size;
	@Prop({ type: Array })
	returns: {
		createdAt: Date;
		returnType: string;
		quantityReturn: number;
	}[];
}
