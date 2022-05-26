import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Egreso de dinero' })
export class Expense extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Consecutivo del egreso' })
	@Prop({ type: Number, default: 0 })
	number: number;

	@Field(() => Number, { description: 'Valor del egreso' })
	@Prop({ type: Number, default: 0 })
	valor: number;

	@Field(() => String, {
		description: 'Concepto del egreso',
		nullable: true,
	})
	@Prop({ type: String })
	concept: string;

	@Field(() => String, {
		description: 'Estado del egreso',
	})
	@Prop({ type: String, default: 'active' })
	status: string;

	@Field(() => Company, {
		description: 'Empresa a la que pertenece el egreso',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que creó o editó el egreso',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
