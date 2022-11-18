import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum GroupDates {
	DAY = 'day',
	MONTH = 'month',
	YEAR = 'year',
}

registerEnumType(GroupDates, { name: 'GroupDates' });

@InputType({ description: 'Filtros para el reporte de ventas' })
export class FiltersSalesReportInput {
	@Field(() => String, { description: 'Fecha inicial del reporte' })
	dateInitial: string;

	@Field(() => String, { description: 'Fecha final del reporte' })
	dateFinal: string;

	@Field(() => Boolean, { description: 'Si es true se agrupan por categoria' })
	isGroupByCategory: boolean;

	@Field(() => GroupDates, {
		description: 'Agrupar por dia, mes o año',
	})
	groupDates: GroupDates;

	@Field(() => String, { description: 'Id de la tienda', nullable: true })
	shopId?: string;
}
