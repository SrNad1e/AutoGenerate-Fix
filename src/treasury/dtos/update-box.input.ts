import { InputType, PartialType } from '@nestjs/graphql';

import { CreateBoxInput } from './create-box.input';

@InputType({ description: 'Datos para actualizar caja' })
export class UpdateBoxInput extends PartialType(CreateBoxInput) {}
