import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Company } from 'src/configurations/entities/company.entity';

@Schema({ collection: 'closesZInvoicingNumbers' })
@ObjectType({ description: 'Númeración de cierre Z de facturación' })
export class CloseZInvoicingNumber extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Prefijo del número' })
	@Prop({ type: String, requiere: true })
	prefix: string;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, requiere: true })
	lastNumber: number;

	@Field(() => Company, {
		description: 'Compañía a la que pertence el npumero de cierre',
	})
	company: Types.ObjectId;
}

export const CloseZInvoicingNumberSchema = SchemaFactory.createForClass(
	CloseZInvoicingNumber,
);
