import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Order } from './order.entity';

@ObjectType({ description: 'Productos de la devolucion' })
export class DetailReturnInvoice {
	@Field(() => Product, { description: 'Producto de la devolución' })
	product: Product;

	@Field(() => Number, {
		description: 'Cantidad de productos de la devolución',
	})
	quantity: number;

	@Field(() => Number, { description: 'Precio del producto de la devolución' })
	price: number;
}

@Schema({ timestamps: true, collection: 'returnsOrder' })
@ObjectType({ description: 'Devoluciones de facturación' })
export class ReturnOrder extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, requiere: true })
	number: number;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la devolución',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => Boolean, {
		description: 'Estado del devolucion',
	})
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => Order, { description: 'Pedido de la devolución' })
	@Prop({ type: Object, required: true })
	order: Types.ObjectId;

	@Field(() => [DetailReturnInvoice], {
		description: 'Productos de la devolución',
		nullable: true,
	})
	@Prop({ type: Array })
	details: DetailReturnInvoice[];

	@Field(() => User, {
		description: 'Usuario que creó o editó la factrura',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}
export const ReturnOrderSchema = SchemaFactory.createForClass(ReturnOrder);
