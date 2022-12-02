import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Opción del permiso' })
export class ActionPermission {
	@Field(() => String, { description: 'Identificador del permiso' })
	_id: string;

	@Field(() => String, { description: 'Nombre de la acción del permiso' })
	name: string;

	@Field(() => String, { description: 'Descripción del permiso' })
	description: string;
}

@ObjectType({ description: 'Opción del permiso' })
export class OptionPermission {
	@Field(() => String, { description: 'Nombre de la opción' })
	name: string;

	@Field(() => [ActionPermission], {
		description: 'Acciones a realizan en la opción',
	})
	actions: ActionPermission[];
}

@ObjectType({ description: 'Permiso' })
export class PermissionData {
	@Field(() => String, { description: 'Nombre del módulo' })
	module: string;

	@Field(() => [OptionPermission], {
		description: 'Opciones del módulo',
	})
	options: OptionPermission[];
}
