/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Image } from 'src/images/entities/image.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './category.entity';
import { Color } from './color.entity';
import { Provider } from './provider.entity';
import { Size } from './size.entity';

@Schema({ timestamps: true })
export class Product extends Document {
	@Prop({ type: String, required: true })
	reference: string;

	@Prop({ type: String, required: true })
	description: string;

	@Prop({ type: String, required: true })
	barcode: string;

	@Prop({ type: Boolean, default: false })
	changeable: boolean;

	@Prop({ type: Object, required: true })
	color: Color;

	@Prop({ type: Object, required: true })
	size: Size;

	@Prop({ type: Object, required: true })
	provider: Provider;

	@Prop({ type: Array, required: true })
	categories: Category[];

	@Prop({ type: Number, required: true })
	price: number;

	@Prop({ type: Number, required: true })
	cost: number;

	@Prop({ type: String, default: 'true' })
	state: string;

	@Prop({ type: Array, default: [] })
	images: Image[];

	@Prop({ type: Object, required: true })
	user: User;

	@Prop({ type: Object, required: true })
	shipping: Shipping;

	//TODO: campo a evaluar
	@Prop({ type: String })
	type: string;

	//TODO: eliminar campo al trasladar a mysql
	@Prop({ type: Number, unique: true })
	id: number;

	/*propiedades que no son del modelo*/

	returnType?: string;
	//TODO: eliminar campo al organizar
	salePriceUnit?: number;
	//TODO: campo generico pendiente eliminarlo
	product_id?: number;
}

export class ProductOrder extends Product {
	quantity: number;
	@Prop({ type: Object, default: [] })
	returns: {
		createdAt: Date;
		returnType: string;
		quantityReturn: number;
	}[];
}

export class ProductTransfer extends Product {
	quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
