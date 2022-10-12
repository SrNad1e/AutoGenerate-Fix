import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/configurations/entities/company.entity';
import { User } from 'src/configurations/entities/user.entity';
import { CloseZInvoicing } from 'src/sales/entities/close-z-invoicing.entity';
import { Box } from './box.entity';

export enum TypeErrorCash {
	MISSING = 'missing',
	SURPLUS = 'surplus',
}

registerEnumType(TypeErrorCash, {
	name: 'TypeErrorCash',
});

@Schema({ timestamps: true })
@ObjectType({ description: 'Errores de traslado de efectivo' })
export class ErrorCash extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Box, {
		description: 'Caja desde donde se realiza el movimiento',
	})
	@Prop({ type: Types.ObjectId, ref: Box.name, required: true })
	boxOrigin: Types.ObjectId;

	@Field(() => Box, {
		description: 'Caja hacia donde se realiza el movimiento',
	})
	@Prop({ type: Types.ObjectId, ref: Box.name, required: true })
	boxDestination: Types.ObjectId;

	@Field(() => CloseZInvoicing, {
		description: 'Cierre que efectúa el error',
		nullable: true,
	})
	@Prop({ type: Types.ObjectId, ref: CloseZInvoicing.name })
	closeZ?: Types.ObjectId;

	@Field(() => Number, { description: 'Valor del movimiento' })
	@Prop({ type: Number, required: true })
	value: number;

	@Field(() => Boolean, {
		description: 'Si ya fue verificados',
	})
	@Prop({ type: Boolean, default: false })
	verified: boolean;

	@Field(() => TypeErrorCash, {
		description: 'Tipo de error',
	})
	@Prop({ type: String, required: true })
	typeError: TypeErrorCash;

	@Field(() => String, {
		description: 'Compañía a la que pertenece el error',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que creó o editó la caja',
	})
	@Prop({ type: Object, required: true })
	user: User;

	

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const ErrorCashSchema = SchemaFactory.createForClass(ErrorCash);
