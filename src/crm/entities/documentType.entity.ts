import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class DocumentType {
	@Field(() => String, { description: 'Nombre del tipo de documento' })
	name: string;

	@Field(() => String, { description: 'Abreviación' })
	abbreviation: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó el pedido',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updateAt: Date;
}
