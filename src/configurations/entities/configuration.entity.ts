/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'config' })
export class Configuration {
	@Prop({ type: String, required: true })
	module: string;

	@Prop({ type: Array, required: true })
	configs: {
		name: string;
		title: string;
		description: string;
		data: any[];
		createdAt: Date;
		updatedAt: Date;
	}[];
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
