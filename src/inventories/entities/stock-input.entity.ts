import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { Company } from 'src/configurations/entities/company.entity';

@ObjectType()
export class DetailInput {
	@Field(() => Product, { description: 'Producto de la entrada' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de producto' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del deltalle a la entrada',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del detalle a la entrada',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stockinput' })
@ObjectType()
export class StockInput extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => [DetailInput], { description: 'Detalles de la entrada' })
	@Prop({ type: Array, required: true })
	details: DetailInput[];

	@Field(() => String, {
		description: 'Estado de la entrada (open, confirmed, cancelled)',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Number, { description: 'Costo total de la entrada' })
	@Prop({ type: Number, required: true })
	total: number;

	@Field(() => Warehouse, { description: 'Bodega de la entrada' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la entrada',
	})
	@Prop({ type: Object, required: true })
	company: Company;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	@Prop({ type: String })
	observation: string;

	@Field(() => User, { description: 'Usuario que creó la entrada' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la entrada' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de la última actulización de la entrada',
	})
	updatedAt: Date;
}

export const StockInputSchema = SchemaFactory.createForClass(StockInput);
