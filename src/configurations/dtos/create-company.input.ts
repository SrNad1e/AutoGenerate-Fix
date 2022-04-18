import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCompanyInput {
	@Field(() => String, { description: 'Nombre de la empresa' })
	name: string;

	@Field(() => String, { description: 'Documento de la compañía' })
	document: string;

	@Field(() => Boolean, {
		description: 'Si pertenece al régimen simplificado',
		nullable: true,
	})
	regimenSimplify: boolean;

	@Field(() => String, { description: 'Dirección de la compañía' })
	address: string;

	@Field(() => String, { description: 'Teléfono de la compañía' })
	phone: string;

	@Field(() => String, { description: 'Url del logo de la compañía' })
	logo: string;
}
