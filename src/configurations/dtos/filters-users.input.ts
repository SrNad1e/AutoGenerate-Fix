import { Field, InputType } from '@nestjs/graphql';
import { StatusUser } from '../entities/user.entity';

@InputType({ description: 'Ordenamiento de los usuarios' })
export class SortUser {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	username?: number;

	@Field({ nullable: true })
	status?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros a aplicar para consultar los usuarios' })
export class FiltersUsersInput {
	@Field(() => String, {
		description:
			'Comodín para la busqueda por nombre,nombre de usuario, documento o correo',
		nullable: true,
	})
	name: string;

	@Field(() => String, { description: 'Identificador del rol', nullable: true })
	roleId: string;

	@Field(() => String, {
		description: 'Identificador del tipo de cliente',
		nullable: true,
	})
	customerTypeId: string;

	@Field(() => StatusUser, {
		description: 'Estado del usuario',
		nullable: true,
	})
	status: StatusUser;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortUser, { description: 'Ordenamiento', nullable: true })
	sort?: SortUser;
}
