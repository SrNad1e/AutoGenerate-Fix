import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para el reporte de ventas' })
export class FiltersSalesReportInput {
	@Field(() => String, { description: 'Fecha inicial del reporte' })
	dateInitial: string;

	@Field(() => String, { description: 'Fecha final del reporte' })
	dateFinal: string;

	@Field(() => Boolean, { description: 'Si es true se agrupan por categoria' })
	isGroupByCategory: boolean;

	@Field(() => String, { description: 'Id de la tienda', nullable: true })
	shopId?: string;
}
