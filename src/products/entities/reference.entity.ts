import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { Attrib } from './attrib.entity';
import { Brand } from './brand.entity';
import { CategoryLevel1 } from './category-level1.entity';
import { CategoryLevel2 } from './category-level2.entity';
import { CategoryLevel3 } from './category-level3.entity';
import { Company } from '../../configurations/entities/company.entity';

@ObjectType({ description: 'Datos de medidas para el envío de los productos' })
export class Shipping {
	@Field(() => Number, { description: 'Ancho del producto' })
	width: number;

	@Field(() => Number, { description: 'Alto del producto' })
	height: number;

	@Field(() => Number, { description: 'Largo del producto' })
	long: number;

	@Field(() => Number, { description: 'Peso del producto' })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto' })
	volume: number;

	@Field(() => User, { description: 'Usuario que crea los datos de envío' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación del dato de envio' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del dato de envio',
	})
	updatedAt: Date;
}

@Schema({ timestamps: true })
@ObjectType({ description: 'Referencia de los productos' })
export class Reference extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la referencia' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Descripción de la referencia' })
	description: string;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Determina si la referencia se puede cambiar',
	})
	changeable: boolean;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Precio de la referencia' })
	price: number;

	@Prop({ type: Number, required: true })
	@Field(() => Number, { description: 'Costo de la referencia' })
	cost: number;

	@Prop({ type: Types.ObjectId, ref: Brand.name, required: true })
	@Field(() => Brand, { description: 'Marca de la referencia' })
	brand: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: CategoryLevel1.name, required: true })
	@Field(() => CategoryLevel1, {
		description: 'Categoría Nivel 1 de la referencia',
	})
	categoryLevel1: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: CategoryLevel2.name, required: true })
	@Field(() => CategoryLevel2, {
		description: 'Categoría Nivel 2 de la referencia',
	})
	categoryLevel2: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: CategoryLevel3.name, required: true })
	@Field(() => CategoryLevel3, {
		description: 'Categoría Nivel 3 de la referencia',
	})
	categoryLevel3: Types.ObjectId;

	@Prop({ type: [Types.ObjectId], ref: Attrib.name, required: true })
	@Field(() => [Attrib], {
		description: 'Atributos de la referencia',
	})
	attribs: Types.ObjectId[];

	@Prop({ type: [Types.ObjectId], ref: Company.name, required: true })
	@Field(() => [Company], {
		description: 'Compañias que pueden usar la referencia',
	})
	companies: Types.ObjectId[];

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la referencia' })
	user: User;

	@Prop({
		type: Object,
		default: {
			width: 0,
			height: 0,
			long: 0,
			weight: 0,
			volume: 0,
		},
	})
	@Field(() => Shipping, { description: 'Medidas de la referencia' })
	shipping: Shipping;

	@Field(() => Date, { description: 'Fecha de creación de la referencia' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la referencia',
	})
	updatedAt: Date;
}

export const ReferenceSchema = SchemaFactory.createForClass(Reference);
