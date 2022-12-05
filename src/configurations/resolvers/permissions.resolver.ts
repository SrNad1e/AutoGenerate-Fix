import { Query, Resolver } from '@nestjs/graphql';

import { PermissionData } from '../dtos/response-permissions';
import { Permissions, RequirePermissions } from '../libs/permissions.decorator';
import { PermissionsService } from '../services/permissions.service';

@Resolver()
export class PermissionsResolver {
	constructor(private readonly permissionsService: PermissionsService) {}

	@Query(() => [PermissionData], {
		name: 'permissions',
		description: 'Se encarga de listar los permisos',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_PERMISSIONS)
	findAll() {
		return this.permissionsService.findAll();
	}
}
