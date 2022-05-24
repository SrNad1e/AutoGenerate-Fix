import { ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Datos para crear un recibo de caja' })
export class CreateReceiptInput {}
