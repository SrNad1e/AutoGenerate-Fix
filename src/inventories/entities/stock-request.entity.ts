import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

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
@ObjectType()
export class StockRequest extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo de identificación' })
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, used, cancelled )',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

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
