import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear empresa' })
export class CreateCompanyInput {
	@Field(() => String, { description: 'Nombre de la empresa' })
	name: string;

	@Field(() => String, { description: 'Documento de la empresa' })
	document: string;

	@Field(() => Boolean, {
		description: 'Si pertenece al régimen simplificado',
		nullable: true,
	})
	regimenSimplify: boolean;

	@Field(() => String, { description: 'Dirección de la empresa' })
	address: string;

	@Field(() => String, { description: 'Teléfono de la empresa' })
	phone: string;

	@Field(() => String, { description: 'Url del logo de la empresa' })
	logo: string;
}
