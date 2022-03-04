import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document, Schema as SchemaMongoose } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { StockTransfer } from './stock-transfer.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class DetailRequest {
	@Field(() => Product, { description: 'Producto de la solicitud' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de la solicitud' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del producto a la solicitud',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizado del producto a la solicitud',
	})
	updateAt: Date;
}

@Schema({ timestamps: true, collection: 'stockrequest' })
@ObjectType()
export class StockRequest extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo de identificación' })
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => String, { description: 'Estado de la solicitud' })
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Warehouse, {
		description: 'Bodega de origen de la solicitud',
	})
	@Prop({ type: Warehouse, required: true })
	warehouseOrigin: Warehouse;

	@Field(() => [DetailRequest], {
		description: 'Detalles de la solicitud',
	})
	@Prop({ type: Array, required: true })
	details: DetailRequest[];

	@Field(() => Warehouse, {
		description: 'Bodega de destino de la solicitud',
	})
	@Prop({ type: Warehouse, required: true })
	warehouseDestination: Warehouse;

	@Field(() => StockTransfer, {
		description: 'Transferencia usada',
		nullable: true,
	})
	@Prop({
		type: SchemaMongoose.Types.ObjectId,
		ref: StockTransfer.name,
		autopopulate: true,
	})
	transfer?: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que crea la solicitud',
	})
	@Prop({ type: User, required: true })
	userIdDestination?: User;

	@Field(() => User, {
		description: 'Observación de la solicitud',
	})
	@Prop({ type: String })
	observation?: string;

	@Field(() => String, {
		description: 'Usuario que crea la solicitud',
		nullable: true,
		deprecationReason: 'Migración mysql',
	})
	@Prop({ type: String })
	code?: string;
}

export const StockRequestSchema = SchemaFactory.createForClass(StockRequest);

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
