import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateCloseVerifiedInput } from '../dtos/create-close-verified-input';
import { CloseVerified } from '../entities/close-verified-invoicing.entity';
import { CloseVerifiedService } from '../services/close-verified.service';

@Resolver()
export class ClosesVerifiedResolver {
	constructor(
		private readonly closeVerifiedService: CloseVerifiedService,
	) {}

	@Query(() => CloseVerified, {
		name: 'closeVerified',
		description: 'consultar un cierre verificado',
	})
	findOne(
		@Args({
			name: 'id',
			description: 'Identificador del cierre',
		})
		id: string,
	) {
		return this.closeVerifiedService.findById(id);
	}

	@Mutation(() => CloseVerified, {
		name: 'createCloseVerified',
		description: 'Crea un cierre verificado',
	})
	create(
		@Args({
			name: 'createCloseVerified',
			nullable: true,
			defaultValue: {},
			description: 'Datos para crear el cierre verificado',
		})
		_: CreateCloseVerifiedInput,
		@Context() context,
	) {
		return this.closeVerifiedService.create(
			context.req.body.variables.input,
		);
	}
}
