import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

export enum StatusStockOutput {
	OPEN = 'open',
	CONFIRMED = 'confirmed',
	CANCELLED = 'cancelled',
}

registerEnumType(StatusStockOutput, { name: 'StatusStockOutput' });

@ObjectType({ description: 'Detalle de la salida de productos' })
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
@ObjectType({ description: 'Salida de productos' })
export class StockOutput extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, required: true })
	number: number;

	@Field(() => [DetailOutput], { description: 'Detalles de la salida' })
	@Prop({ type: Array, required: true })
	details: DetailOutput[];

	@Field(() => StatusStockOutput, {
		description: 'Estado de la salida',
	})
	@Prop({ type: String, default: 'open' })
	status: StatusStockOutput;

	@Field(() => Number, { description: 'Costo total de la salida' })
	@Prop({ type: Number, required: true })
	total: number;

	@Field(() => Warehouse, { description: 'Bodega de la salida' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la salida',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

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
