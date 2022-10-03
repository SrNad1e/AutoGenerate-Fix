import { Field, InputType } from '@nestjs/graphql';
import { TypeErrorCash } from '../entities/error-cash.entity';

@InputType({ description: 'Datos para crear un error de los productos' })
export class CreateErrorCashInput {
	@Field(() => String, { description: 'Cierre que genera el error' })
	closeZId: string;

	@Field(() => Number, { description: 'Valor del error' })
	value: number;

	@Field(() => TypeErrorCash, { description: 'Tipo de error' })
	typeError: TypeErrorCash;
}
