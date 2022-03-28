import { Field } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PointOfSale extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;
}
