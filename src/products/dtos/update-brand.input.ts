import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBrandInput {
	@Field(() => String, {
		description: 'Valor asignado a la marca',
		nullable: true,
	})
	name?: string;

	@Field(() => Boolean, {
		description: 'Se encuentra activa la marca',
		nullable: true,
	})
	active?: boolean;
}
