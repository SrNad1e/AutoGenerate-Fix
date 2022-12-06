import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PERMISSIONS_KEY } from '../libs/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const ctx = GqlExecutionContext.create(context);

		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (!requiredRoles) {
			return true;
		}
		const { user } = ctx.getContext().req;

		const permissionsUser = user.user.role.permissions.map(
			(permission) => permission.action,
		);

		return requiredRoles.some((role) => permissionsUser?.includes(role));
	}
}
