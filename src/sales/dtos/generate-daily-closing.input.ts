import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear cierre diario por fechas' })
export class GenerateDailyClosingInput {
	@Field(() => String, { description: 'Fecha inicial' })
	dateInitial: string;

	@Field(() => String, { description: 'Fecha inicial' })
	dateFinal: string;

	@Field(() => String, { description: 'Id de la tienda' })
	shopId: string;
}
