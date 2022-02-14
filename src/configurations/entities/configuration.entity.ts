/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Schema({ timestamps: true, collection: 'config' })
@ObjectType()
export class Configuration {
	@Field(() => ID)
	_id: string;

	@Prop({ type: String, required: true })
	@Field()
	module: string;

	@Prop({ type: Array, required: true })
	@Field(() => [Configs])
	configs: Configs[];
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

ConfigurationSchema.index({ module: 1 });

@ObjectType()
export class Configs {
	@Field()
	name: string;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field(() => [Data])
	data: Data[];

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

@ObjectType()
export class Data {
	@Field()
	type: string;

	@Field()
	name: string;

	@Field(() => String || Number)
	value: string | number;
}
