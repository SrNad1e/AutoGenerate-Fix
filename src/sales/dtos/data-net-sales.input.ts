import { Field, InputType } from "@nestjs/graphql";

@InputType({description: 'Datos para calcular y obtener las ventas netas'})
export class DataGetNetSalesInput{

    @Field(()=>String, {description: 'Fecha inicial para el cálculo de las ventas'})
    dateInitial: string;

    @Field(()=>String, {description: 'Fecha final para el cálculo de las ventas'})
    dateFinal: string;

    @Field(()=>String, {description: 'Identificador de la tienda a calcular', nullable:true})
    shopId?: string;

}