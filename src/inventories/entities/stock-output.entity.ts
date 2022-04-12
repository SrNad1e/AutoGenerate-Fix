/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/products/entities/company.entity';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class DetailOutput {
	@Field(() => Product, { description: 'Producto de la salida' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de producto' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del deltalle a la salida',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del detalle a la salida',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stockoutput' })
@ObjectType()
export class StockOutput extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => [DetailOutput], { description: 'Detalles de la salida' })
	@Prop({ type: Array, required: true })
	details: DetailOutput[];

	@Field(() => String, {
		description: 'Estado de la salida (open, confirmed, cancelled)',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Number, { description: 'Costo total de la salida' })
	@Prop({ type: Number, required: true })
	total: number;

	@Field(() => Warehouse, { description: 'Bodega de la salida' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la salida',
	})
	@Prop({ type: Object, required: true })
	company: Company;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	@Prop({ type: String })
	observation: string;

	@Field(() => User, { description: 'Usuario que creó la salida' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la salida' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de la última actulización de la salida',
	})
	updatedAt: Date;
}
export const StockOutputSchema = SchemaFactory.createForClass(StockOutput);
