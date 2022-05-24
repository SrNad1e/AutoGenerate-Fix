import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/configurations/entities/company.entity';

import { Box } from './box.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Historial de movimientos de inventario' })
export class BoxHistory extends Document {
	@Field(() => String, { description: 'Identificador mongo' })
	_id: Types.ObjectId;

	@Field(() => Box, { description: 'Caja' })
	@Prop({ type: Types.ObjectId, ref: 'Box' })
	box: Types.ObjectId;

	@Field(() => Number, { description: 'Valor antes del movimiento en la caja' })
	@Prop({ types: Number })
	currentValue: number;

	@Field(() => Company, {
		description: 'Empresa a la que pertenece el movimiento',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => Number, { description: 'Valor del movimiento' })
	@Prop({ types: Number })
	value: number;

	@Field(() => String, {
		description: 'Tipo de documento (receipt, transfer, expense)',
	})
	@Prop({ type: String })
	documentType: string;

	@Field(() => Number, { description: 'Número consecutivo del documento' })
	@Prop({ type: Number })
	documentNumber: number;

	@Field(() => Date, { description: 'Fecha de creación del movimiento' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del movimiento' })
	updatedAt: Date;
}

export const BoxHistorySchema = SchemaFactory.createForClass(BoxHistory);
