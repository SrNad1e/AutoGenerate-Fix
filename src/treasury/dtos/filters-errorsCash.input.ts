import { Field, InputType } from "@nestjs/graphql";
import { TypeErrorCash } from '../entities/error-cash.entity'

@InputType({ description: "Ordenamient" })
export class SortErrosCash {
    @Field(() => Number, { nullable: true })
    value?: number;

    @Field(() => Number, { nullable: true })
    verified?: number;
}

@InputType({ description: 'Listado de errores de efectivo' })
export class FiltersErrorsCashInput {

    @Field({ description: 'cantidad de efectivo', nullable: true })
    value?: number;

    @Field({ description: 'Número del cierre que efectúa el error', nullable: true })
    closeZNumber?: number;

    @Field(() => String, { description: 'tiendas', nullable: true })
	boxId?: string;

    @Field(() => Boolean, {
        description: 'Si ya fue verificado',
        nullable: true
    })
    verified?: boolean;

    @Field(() => TypeErrorCash, {
        description: 'Tipo de error',
        nullable: true
    })
    typeError?: TypeErrorCash;

    @Field({ description: 'Cantidad de registros', nullable: true })
    limit?: number;

    @Field({ description: 'Página actual', nullable: true })
    page?: number;

    @Field(() => SortErrosCash, { description: 'Ordenamiento', nullable: true })
    sort?: SortErrosCash;
}