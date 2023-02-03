import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/configurations/entities/company.entity';

@Schema()
@ObjectType({ description: 'Númeración para los recibos de caja' })
export class ReceiptNumber extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Prefijo del recibo de caja' })
	@Prop({ type: String, required: true })
	prefix: string;

	@Field(() => Number, { description: 'Consecutivo del recibo de caja' })
	@Prop({ type: Number, default: 0 })
	lastNumber: number;

	@Field(() => Company, { description: 'Compañia a la que pertenece' })
	@Prop({ type: Types.ObjectId, default: 0 })
	company: Types.ObjectId;
}

export const ReceiptNumberSchema = SchemaFactory.createForClass(ReceiptNumber);
