import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Customer } from 'src/crm/entities/customer.entity';

export enum StatusCredit {
	ACTIVE = 'active',
	FINISH = 'finish',
	SUSPEND = 'suspend',
}

registerEnumType(StatusCredit, { name: 'StatusCredit' });

@ObjectType({ description: 'Detalle del crédito' })
export class DetailCredit {
	@Field(() => String, { description: 'Pedido que reporta el crédito' })
	orderId: Types.ObjectId;

	@Field(() => Number, { description: 'Monto pendiente en el pedido' })
	balance: number;

	@Field(() => Number, { description: 'Monto total del pedido en crédito' })
	total: number;
}

@Schema({ timestamps: true })
@ObjectType({ description: 'Crédito del cliente' })
export class Credit extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Customer, { description: 'Cliente al que pertenece el crédito' })
	@Prop({ type: Types.ObjectId, required: true, ref: Customer.name })
	customer: Types.ObjectId;

	@Field(() => Number, { description: 'Monto habilitado para el crédito' })
	@Prop({ type: Number, default: 0 })
	amount: number;

	@Field(() => [DetailCredit], {
		description: 'Detalle de la afectación del crédito',
		nullable: true,
	})
	@Prop({ type: Array, default: [] })
	details?: DetailCredit[];

	@Field(() => String, {
		description: 'Compañía a la que pertenece el crédito',
	})
	@Prop({ type: Types.ObjectId })
	company: Types.ObjectId;

	@Field(() => StatusCredit, { description: 'Estado del crédito' })
	@Prop({ type: String, default: 'active' })
	status: StatusCredit;

	@Field(() => Number, { description: 'Monto disponible para el crédito' })
	@Prop({ type: Number, default: 0 })
	available: number;

	@Field(() => Number, { description: 'Monto usado del crédito' })
	@Prop({ type: Number, default: 0 })
	balance: number;

	@Field(() => Number, {
		description: 'Monto congelado que no ha sido finalizado',
	})
	frozenAmount: number;

	@Field(() => User, { description: 'Usuario que creó o editó la cartera' })
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
