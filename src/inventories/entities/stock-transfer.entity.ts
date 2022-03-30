import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as SchemaMongo } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from 'src/products/entities/product.entity';
import { StockRequest } from './stock-request.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true, collection: 'stocktransfer' })
@ObjectType()
export class StockTransfer extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: Number, default: 0, unique: true })
	@Field(() => Number, { description: 'Consecutivo del traslado' })
	number: number;

	@Prop({ type: String, default: 'open' })
	@Field(() => String, {
		description:
			'Estado del traslado (open, sent, confirmed, incomplete, cancelled, verified )',
	})
	status: string;

	@Prop({ type: Object, required: true })
	@Field(() => Warehouse, { description: 'Bodega de origen del traslado' })
	warehouseOrigin: Warehouse;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario de origen del traslado' })
	userOrigin: User;

	@Prop({ type: Array, required: true })
	@Field(() => [DetailTransfer], { description: 'Detalle de los productos' })
	details: DetailTransfer[];

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
		type: [SchemaMongo.Types.ObjectId],
		ref: 'StockRequest',
		autopopulate: true,
	})
	@Field(() => [StockRequest], {
		description: 'Solicitudes usadas',
		nullable: true,
	})
	requests: Types.ObjectId[];

	@Field(() => Date, { description: 'Fecha de creación del traslado' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;
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
		nullable: true,
	})
	quantityConfirmed?: number;

	@Field(() => String, {
		description: 'Estado del producto (confirmed, new)',
	})
	status: string;

	@Field(() => Date, {
		description: 'Fecha de agregado el producto',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizacion el producto',
	})
	updatedAt: Date;
}

@Entity({ name: 'stock_transfer' })
export class StockTransferMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	code: string;

	@Column({ type: 'varchar' })
	status: string;

	@Column({ type: 'int' })
	warehouse_origin_id: number;

	@Column({ type: 'int' })
	warehouse_destination_id: number;

	@Column({ type: 'int' })
	origin_user_id: number;

	@Column({ type: 'int' })
	destination_user_id: number;

	@Column({ type: 'varchar' })
	observations_origin: string;

	@Column({ type: 'varchar' })
	observations_destination: string;

	@Column({ type: 'varchar' })
	observations: string;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'varchar' })
	type: string;
}

@Entity({ name: 'stock_transfer_detail' })
export class StockTransferDetailMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	product_id: number;

	@Column({ type: 'int' })
	transfer_id: number;

	@Column({ type: 'int' })
	quantity: number;

	@Column({ type: 'int' })
	quantity_confirmed: number;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'datetime' })
	updated_at: Date;
}
