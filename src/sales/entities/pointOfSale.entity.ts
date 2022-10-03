import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/configurations/entities/company.entity';
import { Shop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';

import { Box } from 'src/treasury/entities/box.entity';
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
	@Prop({
		type: Types.ObjectId,
		ref: Shop.name,
		autopopulate: true,
		required: true,
	})
	shop: Types.ObjectId;

	@Field(() => AuthorizationDian, {
		description: 'Tienda a la que pertenece el punto de venta',
	})
	@Prop({ type: Types.ObjectId, ref: 'AuthorizationDian', unique: true })
	authorization: Types.ObjectId;

	@Field(() => Company, {
		description: 'Compañia a la que pertenece el punto de venta',
	})
	@Prop({ type: Types.ObjectId, ref: 'Compnay', required: true })
	company: Types.ObjectId;

	@Field(() => Box, {
		description: 'Caja del punto de venta',
	})
	@Prop({ type: Types.ObjectId, ref: 'Box', required: true })
	box: Types.ObjectId;

	@Field(() => Date, { description: 'Fecha de cierre', nullable: true })
	@Prop({ type: Date, default: new Date() })
	closeDate: Date;

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
