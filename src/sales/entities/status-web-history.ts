import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { Order } from './order.entity';

export enum StatusWeb {
	OPEN = 'open',
	PENDING = 'pending',
	PENDING_CREDIT = 'pendingCredit',
	PAYMENT_CONFIRMED = 'closed',
	PREPARING = 'preparing',
	DELIVERED = 'delivered',
	SENT = 'sent',
	CANCELLED = 'cancelled',
}

registerEnumType(StatusWeb, { name: 'StatusWeb' });

@Schema({ timestamps: true })
@ObjectType({ description: 'Histórico de estados de los pedidos web' })
export class StatusWebHistory extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Order, { description: 'Pedido al que pertenece el registro' })
	@Prop({
		type: Types.ObjectId,
		ref: 'Order',
		autopopulate: true,
	})
	order: Types.ObjectId;

	@Field(() => StatusWeb, {
		description: 'Estado del registro',
	})
	@Prop({
		type: String,
	})
	status: StatusWeb;

	@Field(() => User, {
		description: 'Usuario que creó el registro',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const StatusWebHistorySchema =
	SchemaFactory.createForClass(StatusWebHistory);
