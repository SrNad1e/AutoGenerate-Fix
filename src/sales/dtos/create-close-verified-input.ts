import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un cierre verificado' })
export class CreateCloseVerifiedInput {
    @Field(() => Number, { description: 'Dinero registrado' })
    cashRegister: number;

    @Field(() => Number, { description: 'Dinero reportado' })
    cashReport: number;

    @Field(() => Number, { description: 'egresos' })
    expenses: number;

    @Field(() => Number, { description: 'Cantidad de ventas por datafono reportadas' })
    dataphoneReport: number;

    @Field(() => Number, { description: 'Cantidad de transferencias reportadas' })
    bankReport: number;

    @Field(() => String, { description: 'Observacion' })
    observation: string;

    @Field(() => String, { description: 'Identificador del cierre z que se va a verificar' })
    closeZId: string;
}
