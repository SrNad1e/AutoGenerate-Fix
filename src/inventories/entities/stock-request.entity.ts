import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

export enum StatusStockRequest {
	OPEN = 'open',
	PENDING = 'pending',
	USED = 'used',
	CANCELLED = 'cancelled',
}

registerEnumType(StatusStockRequest, { name: 'StatusStockRequest' });

@ObjectType()
export class DetailRequest {
	@Field(() => Product, { description: 'Producto de la solicitud' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de la solicfitud' })
	quantity: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del producto a la solicitud',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizado del producto a la solicitud',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stockrequest' })
@ObjectType({ description: 'Solicitud de productos' })
export class StockRequest extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo de identificación' })
	@Prop({ type: Number, required: true })
	number: number;

	@Field(() => StatusStockRequest, {
		description: 'Estado de la solicitud',
	})
	@Prop({ type: String, default: 'open' })
	status: StatusStockRequest;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la solicitud',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => Warehouse, {
		description: 'Bodega de origen de la solicitud',
	})
	@Prop({ type: Object, required: true })
	warehouseOrigin: Warehouse;

	@Field(() => [DetailRequest], {
		description: 'Detalles de la solicitud',
	})
	@Prop({ type: Array, required: true })
	details: DetailRequest[];

	@Field(() => Warehouse, {
		description: 'Bodega de destino de la solicitud',
	})
	@Prop({ type: Object, required: true })
	warehouseDestination: Warehouse;

	@Field(() => User, {
		description: 'Usuario que crea la solicitud',
	})
	@Prop({ type: Object, required: true })
	user?: Partial<User>;

	@Field(() => String, {
		description: 'Observación de la solicitud',
		nullable: true,
	})
	@Prop({ type: String })
	observation?: string;

	@Field(() => Date, { description: 'Fecha de creación de la solicitud' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de la última actulización de la solicitud',
	})
	updatedAt: Date;

	@Field(() => String, {
		description: 'Usuario que crea la solicitud',
		nullable: true,
		deprecationReason: 'Migración mysql',
	})
	@Prop({ type: String })
	code?: string;
}

export const StockRequestSchema = SchemaFactory.createForClass(StockRequest);
