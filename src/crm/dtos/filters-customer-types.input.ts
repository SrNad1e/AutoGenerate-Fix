import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para obtener los tipos de cliente' })
export class FiltersCustomerTypesInput {
	@Field(() => String, {
		description: 'Nombre comodín para la busqueda de tipos de cliente',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Identificador del tipo de documento',
		nullable: true,
	})
	_id: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}
