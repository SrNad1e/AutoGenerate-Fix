import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Credit } from './credit.entity';

export enum TypeCreditHistory {
	CREDIT = 'credit',
	DEBIT = 'debit',
	FROZEN = 'frozen',
	THAWED = 'thawed',
}

registerEnumType(TypeCreditHistory, { name: 'TypeCreditHistory' });

export enum TypeDocument {
	ORDER = 'order',
	RECEIPT = 'receipt',
}

registerEnumType(TypeDocument, { name: 'TypeDocument' });

@Schema({ timestamps: true })
@ObjectType({ description: 'Crédito del cliente' })
export class CreditHistory extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => TypeCreditHistory, {
		description: 'Tipo de movimiento de cartera',
	})
	@Prop({ type: String, required: true })
	type: TypeCreditHistory;

	@Field(() => Number, {
		description: 'Número del documento que relaiza el proceso del pedido',
		nullable: true,
	})
	@Prop({ type: Number })
	documentNumber?: number;

	@Field(() => TypeDocument, {
		description: 'Tipo de documento que genera el movimiento',
		nullable: true,
	})
	@Prop({ type: String })
	documentType?: TypeDocument;

	@Field(() => Number, { description: 'Valor del movimiento' })
	@Prop({ type: Number })
	amount: number;

	@Field(() => Credit, { description: 'Crédito que genera el movimiento' })
	@Prop({ type: Object })
	credit: Credit;

	@Field(() => User, { description: 'Usuario que creó o edito el historial' })
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CreditHistorySchema = SchemaFactory.createForClass(CreditHistory);
