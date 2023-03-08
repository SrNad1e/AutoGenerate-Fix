import { Field, InputType } from '@nestjs/graphql';
import { CashRegisterInput } from './create-close-x-invoicing-input';

@InputType({ description: 'Datos para crear un cierre Z' })
export class CreateCloseZInvoicingInput {
	@Field(() => CashRegisterInput, { description: 'Listado de cash reportado' })
	cashRegister: CashRegisterInput;

	@Field(() => String, { description: 'Identificador del punto de venta' })
	pointOfSaleId: string;

	@Field(() => String, { description: 'Fecha del cierre' })
	closeDate: string;

	@Field(() => Number, { description: 'Cantidad de trasnferencias reportadas' })
	quantityBank: number;

	@Field(() => Number, { description: 'Cantidad de ventas por datafono reportadas' })
	quantityDataphone?: number;
}
