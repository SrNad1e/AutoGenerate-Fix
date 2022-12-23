import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'Respuesta de la creación de los cierres diarios de facturación',
})
export class ResponseGenerateDailyClosing {
	@Field(() => String, { description: 'Mensaje de respuesta' })
	message: string;

	@Field(() => Number, { description: 'Cantidad de cierres diarios creados' })
	quantity: number;
}
