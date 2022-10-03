import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';

export enum DocumentTypesRule {
	CUSTOMERTYPES = 'customerTypes',
	CATEGORIES = 'categories',
	COMPANY = 'company',
	SHOPS = 'shops',
}

registerEnumType(DocumentTypesRule, { name: 'DocumentTypesRule' });

export enum TypesRule {
	EQUAL = 'equal',
	GREATER = 'greater',
	LESS = 'less',
	LESSTHANOREQUAL = 'lessThanOrEqual',
	GREATERTHANOREQUAL = 'greaterThanOrEqual',
}

registerEnumType(TypesRule, { name: 'TypesRule' });

@ObjectType({ description: 'Reglas para el descuento' })
export class Rule {
	@Field(() => DocumentTypesRule, {
		description: 'Tipo de documento para validar el descuento',
	})
	documentType: DocumentTypesRule;

	@Field(() => [String], {
		description: 'Identificador de los documentos',
	})
	documentIds: string[];

	@Field(() => TypesRule, {
		description: 'Tipo de regla que deben cumplir los documentos',
	})
	type: TypesRule;
}

@ObjectType({ description: 'Reglas de descuento' })
@Schema({ timestamps: true })
export class DiscountRule extends Document {
	@Field(() => String, { description: 'Identificación de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la regla' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => [Rule], { description: 'Reglas para aplicar el descuento' })
	@Prop({ type: Array, required: true })
	rules: Rule[];

	@Field(() => Number, { description: 'Valor del descuento' })
	@Prop({ type: Number, default: 0 })
	value: number;

	@Field(() => Number, { description: 'Valor del porcentaje del descuento' })
	@Prop({ type: Number, default: 0 })
	percent: number;

	@Field(() => Date, { description: 'Fecha y hora de inicio del descuento' })
	@Prop({ type: Date, required: true })
	dateInitial: Date;

	@Field(() => Date, { description: 'Fecha y hora del final del descuento' })
	@Prop({ type: Date, required: true })
	dateFinal: Date;

	@Field(() => Boolean, { description: 'Descuenti activo' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => User, {
		description: 'Usuario que creó o editó el descuento',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const DiscountRuleSchema = SchemaFactory.createForClass(DiscountRule);
