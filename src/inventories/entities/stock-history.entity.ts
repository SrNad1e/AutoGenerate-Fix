import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as SchemaMongo } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { Product } from 'src/products/entities/product.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Historial de movimientos de inventario' })
export class StockHistory extends Document {
	@Field(() => String, { description: 'Identificador mongo' })
	_id: Types.ObjectId;

	@Field(() => Warehouse, { description: 'Bodega' })
	@Prop({ type: SchemaMongo.Types.ObjectId, ref: 'Warehouse' })
	warehouse: Types.ObjectId;

	@Field(() => Number, { description: 'Stock del producto en la bodega' })
	@Prop({ types: Number })
	currentStock: number;

	@Field(() => Number, { description: 'Cantidad en movimiento' })
	@Prop({ types: Number })
	quantity: number;

	@Field(() => Company, {
		description: 'Empresa a la que perteneces el movimiento',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => Product, { description: 'Producto' })
	@Prop({ type: SchemaMongo.Types.ObjectId, ref: 'Product' })
	product: Types.ObjectId;

	@Field(() => String, {
		description:
			'Tipo de documento (transfer, input, adjustment, refund, output, invoice, order)',
	})
	@Prop({ type: String })
	documentType: string;

	@Field(() => Number, { description: 'Número consecutivo del documento' })
	@Prop({ type: Number })
	documentNumber: number;

	@Field(() => Date, { description: 'Fecha de creación del traslado' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
