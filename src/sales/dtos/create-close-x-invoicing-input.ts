import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Arqueo de caja' })
export class CashRegisterInput {
	@Field(() => Number, { description: 'Moneda de 50' })
	'M50': number;

	@Field(() => Number, { description: 'Moneda de $ 100' })
	'M100': number;

	@Field(() => Number, { description: 'Moneda de $ 200' })
	'M200': number;

	@Field(() => Number, { description: 'Moneda de $ 500' })
	'M500': number;

	@Field(() => Number, { description: 'Billete o moneda de $ 1.000' })
	'B1000': number;

	@Field(() => Number, { description: 'Billete de $ 2.000' })
	'B2000': number;

	@Field(() => Number, { description: 'Billete de $ 5.000' })
	'B5000': number;

	@Field(() => Number, { description: 'Billete de $ 10.000' })
	'B10000': number;

	@Field(() => Number, { description: 'Billete de $ 20.000' })
	'B20000': number;

	@Field(() => Number, { description: 'Billete de $ 50.000' })
	'B50000': number;

	@Field(() => Number, { description: 'Billete de $ 100.000' })
	'B100000': number;
}

@InputType({ description: 'Datos para crear un cierre X' })
export class CreateCloseXInvoicingInput {
	@Field(() => CashRegisterInput, { description: 'Listado de cash reportado' })
	cashRegister: CashRegisterInput;

	@Field(() => String, { description: 'Identificador del punto de venta' })
	pointOfSaleId: string;

	@Field(() => String, { description: 'Fecha del cierre' })
	closeDate: string;

	@Field(() => Number, { description: 'Cantidad de trasnferencias reportadas' })
	quantityBank: number;
}
