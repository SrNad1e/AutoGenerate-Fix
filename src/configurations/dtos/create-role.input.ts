import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de un rol' })
export class CreateRoleInput {
	@Field(() => String, { description: 'Nombre del rol' })
	name: string;

	@Field(() => [String], {
		description: 'Identificadores de los permisos asignados',
	})
	permissionIds: string[];

	@Field(() => Boolean, {
		description: 'Habilita para que el usuario pueda consulta cualquier bodega',
		nullable: true,
	})
	changeWarehouse: boolean;

	@Field(() => Boolean, {
		description: 'Estado del rol',
		nullable: true,
	})
	active: boolean;
}
