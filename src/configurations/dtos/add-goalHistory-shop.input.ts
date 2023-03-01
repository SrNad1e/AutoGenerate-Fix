import { Field, InputType } from "@nestjs/graphql";

@InputType({ description: 'Historial de meta que se va agregar a la tienda' })
export class GoalHistoryInput {
	@Field(() => Date, { description: 'Fecha del registro' })
	date: Date;

	@Field(() => Number, { description: 'Meta de la tienda' })
	goal: number;

	@Field(() => Number, { description: 'Meta alcanzada por la tienda', nullable: true })
	goalAchieved?: number;
}

@InputType({ description: 'Datos para agregar historial de metas a la tienda' })
export class AddGoalHistoryInput {
	@Field(() => String, {
		description: 'Id de la tienda a la cual se va agregar el historico',
	})
	shopId: string;

	@Field(() => GoalHistoryInput, {
		description: 'Historico de metas',
		nullable: true
	})
	goalHistory?: GoalHistoryInput;
}