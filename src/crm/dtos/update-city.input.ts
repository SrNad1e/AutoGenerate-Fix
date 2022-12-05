import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCityInput } from './create-city.input';

@InputType({ description: 'Datos para actualizar la ciudad' })
export class UpadteCityInput extends PartialType(CreateCityInput) {}
