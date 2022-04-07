import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { Brand } from './brand.entity';
import { Company } from './company.entity';

@ObjectType()
export class Shipping {
	@Field(() => Number, { description: 'Ancho del producto' })
	width: number;

	@Field(() => Number, { description: 'Alto del producto' })
	height: number;

	@Field(() => Number, { description: 'Largo del producto' })
	long: number;

	@Field(() => Number, { description: 'Peso del producto' })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto' })
	volume: number;

	@Field(() => User, { description: 'Usuario que crea los datos de envío' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación del dato de envio' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del dato de envio',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true })
@ObjectType()
export class Reference extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Identificador de mongo' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Descripción de la referencia' })
	description: string;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Determina si la referencia se puede cambiar',
	})
	changeable: boolean;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Costo del producto' })
	cost: number;

	@Field(() => User, { description: 'Usuario que crea la referencia' })
	user: User;

	@Prop({
		type: Object,
		default: {
			width: 0,
			height: 0,
			long: 0,
			weight: 0,
			volume: 0,
		},
	})
	@Field(() => Shipping, { description: 'Medidas del producto' })
	shipping: Shipping;

	@Field(() => Date, { description: 'Fecha de creación de la referencia' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la referencia',
	})
	updatedAt: Date;
}

export const ReferenceSchema = SchemaFactory.createForClass(Reference);
