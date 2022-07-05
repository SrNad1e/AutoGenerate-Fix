import { InputType, PartialType } from '@nestjs/graphql';

import { CreateCompanyInput } from './create-company.input';

@InputType({ description: 'Datos para actualizar la compañía' })
export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {}
