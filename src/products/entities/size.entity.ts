import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Size {
	@Field(() => String, { description: 'Valor de la talla' })
	value: string;
}
