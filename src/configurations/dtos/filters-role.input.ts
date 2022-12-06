import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para consultar el rol' })
export class FiltersRoleInput {
	@Field(() => String, { description: 'Nombre del rol', nullable: true })
	name: string;
}
