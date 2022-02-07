/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserMysql } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
export class Warehouse extends Document {
	@Prop({ type: Number, required: true })
	shopId: number;

	@Prop({ type: Object, required: true })
	user: UserMysql;

	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Prop({ type: Boolean, default: true })
	active: boolean;

	//TODO: campo temporal mientras se migra a mongo
	@Prop({ type: Number, required: true })
	id: number;
}

export class WarehouseO extends Warehouse {
	@Prop({ type: Number })
	warehouseId: number;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
