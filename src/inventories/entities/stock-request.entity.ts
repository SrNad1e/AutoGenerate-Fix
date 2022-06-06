import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';

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
	@Prop({ type: Number, default: 0, unique: true })
	number: number;

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, used, cancelled )',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Company, {
		description: 'Compañía a la que pertence la solicitud',
	})
	@Prop({ type: Object, required: true })
	company: Company;

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
