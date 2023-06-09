import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { StockTransfer } from './stock-transfer.entity';
import { Company } from 'src/configurations/entities/company.entity';

export enum StatusDetailTransferError {
	MISSING = 'missing',
	SURPLUS = 'surplus',
	CONFIRMED = 'confirmed',
}

registerEnumType(StatusDetailTransferError, {
	name: 'StatusDetailTransferError',
});

@ObjectType({ description: 'Detalle del traslado de productos' })
export class DetailTransferError {
	@Field(() => Product, {
		description: 'Producto del detalle',
	})
	product: Product;

	@Field(() => Number, {
		description: 'Cantidad del productos en el traslado',
	})
	quantity: number;

	@Field(() => StatusDetailTransferError, {
		description: 'Estado del producto',
	})
	status: StatusDetailTransferError;

	@Field(() => String, {
		description: 'Motivo del proceso',
		nullable: true,
	})
	reason?: string;

	@Prop({ type: Object })
	@Field(() => User, {
		description: 'Usuario que valida el error',
		nullable: true,
	})
	user?: User;

	@Prop({ type: Date, default: new Date() })
	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'stocktransfererror' })
@ObjectType({ description: 'Errores en traslados de productos' })
export class StockTransferError extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: StockTransfer.name, required: true })
	@Field(() => StockTransfer, {
		description: 'Traslado al que está relacionado',
	})
	stockTransfer: Types.ObjectId;

	@Prop({ type: Array, required: true })
	@Field(() => [DetailTransferError], {
		description: 'Detalle de los productos que están en error',
	})
	details: DetailTransferError[];

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Si ya fue verificados todos los errores',
	})
	verified: boolean;

	@Field(() => Date, { description: 'Fecha de creación del traslado' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización del traslado' })
	updatedAt: Date;

	@Prop({ type: Types.ObjectId, required: true })
	@Field(() => Company, { description: 'Compañía del traslado' })
	company: Types.ObjectId;
}

export const StockTransferErrorSchema =
	SchemaFactory.createForClass(StockTransferError);
