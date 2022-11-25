import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Resultado de facturación' })
export class ResponseInvoicing {
	@Field(() => Number, { description: 'Cantidad de facturas generadas' })
	invoiceQuantity: number;

	@Field(() => Number, { description: 'Valor no facturado' })
	valueMissing: number;

	@Field(() => Number, { description: 'Valor total facturado' })
	valueInvoicing: number;
}
