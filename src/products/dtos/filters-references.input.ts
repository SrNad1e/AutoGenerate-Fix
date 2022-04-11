import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersReferencesInput {
	@Field(() => String, {
		description: 'Comodín para la busqueda de las referencias',
		nullable: true,
	})
	name?: string;

	@Field(() => Number, {
		description: 'Precio para la busqueda de referencias',
		nullable: true,
	})
	price?: number;

	@Field(() => Number, {
		description: 'Costo para la busqueda de referencias',
		nullable: true,
	})
	cost?: number;

	@Field(() => String, {
		description: 'Identificación de la marca',
		nullable: true,
	})
	brandId?: string;

	@Field(() => String, {
		description: 'Identificación de la compañía',
	})
	companyId: string;
}
