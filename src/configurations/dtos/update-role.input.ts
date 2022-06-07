import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar el rol' })
export class UpdateRoleInput {
	@Field(() => String, { description: 'Nombre del rol', nullable: false })
	name?: string;

	@Field(() => [String], {
		description: 'Identificadores de los permisos seleccionados',
		nullable: true,
	})
	permissionIds?: string[];

	@Field(() => Boolean, { description: 'Puede el usuario cambiar su bodega' })
	changeWarehouse?: boolean;

	@Field(() => Boolean, { description: 'Estado del rol' })
	active?: boolean;
}
