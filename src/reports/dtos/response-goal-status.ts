import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'Datos resultado de la consulta de Estado de la meta',
})
export class ResponseGoalStatus {
	@Field(() => Number, { description: 'Venta neta generada por el usuario' })
	netSale: number;

	@Field(() => Number, { description: 'Meta' })
	goal: number;
}
