import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Product } from 'src/products/entities/product.entity';
import { StockRequest } from './stock-request.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Company } from 'src/configurations/entities/company.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

export enum StatusStockTransfer {
	OPEN = 'open',
	SENT = 'sent',
	CONFIRMED = 'confirmed',
	INCOMPLETE = 'incomplete',
	CANCELLED = 'cancelled',
	VERIFIED = 'verified',
}

registerEnumType(StatusStockTransfer, { name: 'StatusStockTransfer' });

export enum StatusDetailTransfer {
	NEW = 'new',
	SENT = 'sent',
	CONFIRMED = 'confirmed',
}

registerEnumType(StatusDetailTransfer, { name: 'StatusDetailTransfer' });

@ObjectType({ description: 'Detalle del traslado de productos' })
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
		nullable: true,
	})
	quantityConfirmed?: number;

	@Field(() => StatusDetailTransfer, {
		description: 'Estado del producto',
	})
	status: StatusDetailTransfer;

	@Field(() => Date, {
		description: 'Fecha de agregado el producto',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizacion el producto',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stocktransfer' })
@ObjectType({ description: 'Translado de productos' })
export class StockTransfer extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Consecutivo del traslado' })
	number: number;

	@Prop({ type: String, default: 'open' })
	@Field(() => StatusStockTransfer, {
		description: 'Estado del traslado',
	})
	status: StatusStockTransfer;

	@Prop({ type: Object, required: true })
	@Field(() => Warehouse, { description: 'Bodega de origen del traslado' })
	warehouseOrigin: Warehouse;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario de origen del traslado' })
	userOrigin: User;

	@Prop({ type: Array, required: true })
	@Field(() => [DetailTransfer], { description: 'Detalle de los productos' })
	details: DetailTransfer[];

	@Field(() => Company, {
		description: 'Compañía a la que pertence el traslado',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

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

	@Prop({
		type: [Types.ObjectId],
		ref: 'StockRequest',
		autopopulate: true,
		default: [],
	})
	@Field(() => [StockRequest], {
		description: 'Solicitudes usadas',
		nullable: true,
	})
	requests?: Types.ObjectId[];

	@Field(() => Date, { description: 'Fecha de creación del traslado' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
