import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para generar cierre diario' })
export class CreateDailyClosingInput {
	@Field(() => String, { description: 'Identificador del punto de venta' })
	pointOfSaleId: string;

	@Field(() => String, { description: 'Fecha de cierre' })
	closeDate: string;

	@Field(() => [String], { description: 'Facturas del cierre' })
	invoicesId: string[];
}
