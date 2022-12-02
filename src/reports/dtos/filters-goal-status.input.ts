import { Field, InputType } from "@nestjs/graphql";

@InputType({ description: 'Datos para consultar el estado de la meta' })
export class FiltersGoalStatusInput {

    @Field(() => String, { description: 'Identificador de la tienda', nullable: true })
    shopId?: string

    @Field(() => String, { description: 'Mes a evaluar la meta' })
    month: string
}