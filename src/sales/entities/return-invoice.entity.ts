import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { Invoice } from './invoice.entity';
import { AuthorizationDian } from './authorization.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/configurations/entities/user.entity';

@ObjectType({ description: 'Productos de la devolucion' })
export class DetailReturnInvoice {
	@Field(() => Product, { description: 'Producto agregado a la factura' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de productos en la factura' })
	quantity: number;

	@Field(() => Number, { description: 'Precio del producto en la factura' })
	price: number;
}

@Schema({ timestamps: true, collection: 'returnsInvoice' })
@ObjectType({ description: 'Devoluciones de facturación' })
export class ReturnInvoice extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, requiere: true })
	number: number;

	@Field(() => Company, { description: 'Compañía a la que pertence el ajuste' })
	@Prop({ type: Object, required: true })
	company: Company;

	@Field(() => Warehouse, { description: 'Bodega del ajuste' })
	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Field(() => String, {
		description: 'Estado del ajuste (open, confirmed, cancelled)',
	})
	@Prop({ type: String, default: 'open' })
	status: string;

	@Field(() => Invoice, { description: 'Factura de la devolución' })
	@Prop({ type: Object, required: true })
	invoice: Invoice;

	@Field(() => AuthorizationDian, {
		description: 'Autorización',
	})
	@Prop({ type: Object, required: true })
	authorization: AuthorizationDian;

	@Field(() => [DetailReturnInvoice], {
		description: 'Productos de la devolución',
		nullable: true,
	})
	@Prop({ type: Array })
	details: DetailReturnInvoice[];

	@Field(() => User, {
		description: 'Usuario que creó o editó la factrura',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}
export const ReturnInvoiceSchema = SchemaFactory.createForClass(ReturnInvoice);
