/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import { Product } from 'src/products/entities/product.entity';
import { StockRequest } from './stock-request.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true, collection: 'stocktransfer' })
@ObjectType()
export class StockTransfer extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Prop({ type: Number, default: 0, unique: true })
	@Field(() => Number, { description: 'Consecutivo del traslado' })
	number: number;

	@Prop({ type: String, default: 'open' })
	@Field(() => String, { description: 'Estado del traslado' })
	status: string;

	@Prop({ type: Object, required: true })
	@Field(() => Warehouse, { description: 'Bodega de origen del traslado' })
	warehouseOrigin: Warehouse;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario de origen del traslado' })
	userOrigin: User;

	@Prop({ type: Array, required: true })
	@Field(() => [DetailTransfer], { description: 'Detalle de los productos' })
	detail: DetailTransfer[];

	@Prop({ type: String })
	@Field(() => String, {
		description: 'Observación del que crea el traslado',
		nullable: true,
	})
	observationOrigin?: string;

	@Prop({ type: Object, required: true })
	@Field(() => Warehouse, { description: 'Bodega de origen del traslado' })
	warehouseDestination: Warehouse;

	@Prop({ type: Object })
	@Field(() => User, {
		description: 'Usuario de destino del traslado',
		nullable: true,
	})
	userDestination?: User;

	@Prop({ type: String })
	@Field(() => String, {
		description: 'Observación del que crea el traslado',
		nullable: true,
	})
	observationDestination?: string;

	@Prop({ type: String })
	@Field(() => String, {
		description: 'Observación general',
		nullable: true,
	})
	observation?: string;

	@Prop({ type: Array, default: [] })
	@Field(() => [StockRequest], { description: 'Solicitudes usadas' })
	requests: StockRequest[];
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);

@ObjectType()
class DetailTransfer {
	@Field(() => Product, {
		description: 'Producto del detalle',
	})
	product: Product;

	@Field(() => Number, {
		description: 'Cantidad del productos en el traslado',
	})
	quantity: number;

	@Field(() => Number, {
		description: 'Cantidad del productos confirmados en el traslado',
	})
	quantityConfirmed?: number;

	@Field(() => String, {
		description: 'Estado del producto',
	})
	status: string;

	@Field(() => Date, {
		description: 'Fecha de agregado el producto',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizacion el producto',
	})
	updateAt: Date;
}
