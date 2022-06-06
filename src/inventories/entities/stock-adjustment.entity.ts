import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

@ObjectType({ description: 'Detalle de ajuste de productos' })
export class DetailAdjustment {
	@Field(() => Product, { description: 'Producto de la ajuste' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de producto' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del deltalle al ajuste',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del detalle al ajuste',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stockadjustment' })
@ObjectType({ description: 'Ajuste de productos' })
export class StockAdjustment extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, requiere: true })
	number: number;

	@Field(() => [DetailAdjustment], { description: 'Detalles del ajuste' })
	@Prop({ type: Array, required: true })
	details: DetailAdjustment[];

	@Field(() => String, {
		description: 'Estado del ajuste (open, confirmed, cancelled)',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Number, { description: 'Costo total del ajuste' })
	@Prop({ type: Number, required: true })
	total: number;

	@Field(() => Warehouse, { description: 'Bodega del ajuste' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => Company, { description: 'Compañía a la que pertence el ajuste' })
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	@Prop({ type: String })
	observation: string;

	@Field(() => User, { description: 'Usuario que creó el ajuste' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la entrada' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de la última actulización de la entrada',
	})
	updatedAt: Date;
}
export const StockAdjustmentSchema =
	SchemaFactory.createForClass(StockAdjustment);
