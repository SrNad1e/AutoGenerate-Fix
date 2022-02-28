import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserMysql } from 'src/users/entities/user.entity';
import { Warehouse } from './warehouse.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Shop extends mongoose.Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: mongoose.ObjectId;

	@Field()
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => UserMysql)
	@Prop({ type: Object })
	user: UserMysql;

	@Field()
	@Prop({ type: String, default: 'active' })
	status: string;

	@Field()
	@Prop({ type: String })
	address: string;

	@Field()
	@Prop({ type: String })
	phone: string;

	@Field()
	@Prop({ type: Number })
	goal: number;

	@Field(() => Warehouse, {
		description: 'Bodega predeterminada para la tienda',
		nullable: true,
	})
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Warehouse.name,
		autopopulate: true,
	})
	defaultWarehouse: mongoose.Schema.Types.ObjectId;

	//TODO: se debe normalizar los ids de los modelos
	@Field()
	@Prop({ type: Number, unique: true })
	shopId?: number;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
