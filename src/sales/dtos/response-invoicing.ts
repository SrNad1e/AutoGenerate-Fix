import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Resultado de facturación' })
export class ResponseInvoicing {
	@Field(() => Number, { description: 'Cantidad de facturas generadas' })
	invoiceQuantityCash: number;

	@Field(() => Number, { description: 'Cantidad de facturas generadas' })
	invoiceQuantityBank: number;

	@Field(() => Number, { description: 'Valor total facturado' })
	valueInvoicingCash: number;

	@Field(() => Number, { description: 'Valor total facturado' })
	valueInvoicingBank: number;
}
