import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthorizationDian } from './authorization.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Punto de venta de la tienda' })
export class PointOfSale extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del punto de venta' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => Shop, {
		description: 'Tienda a la que pertenece el punto de venta',
	})
	@Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
	shop: Types.ObjectId;

	@Field(() => AuthorizationDian, {
		description: 'Tienda a la que pertenece el punto de venta',
	})
	@Prop({ type: Types.ObjectId, ref: 'AuthorizationDian', required: true })
	authorization: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que creó o editó el punto de venta',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const PointOfSaleSchema = SchemaFactory.createForClass(PointOfSale);
