import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateAttribInput } from '../dtos/create-attrib.input';
import { FiltersAttribsInput } from '../dtos/filters-attribs.input';
import { ResponseAttribs } from '../dtos/response-attribs';
import { UpdateAttribInput } from '../dtos/update-attrib.input';
import { Attrib } from '../entities/attrib.entity';
import { AttribsService } from '../services/attribs.service';

@Resolver()
export class AttribsResolver {
	constructor(private readonly attribsService: AttribsService) {}

	@Query(() => ResponseAttribs, { name: 'attribs' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersAttribsInput', nullable: true, defaultValue: {} })
		_: FiltersAttribsInput,
		@Context() context,
	) {
		return this.attribsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Attrib, { name: 'createAttrib' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createAttribInput')
		_: CreateAttribInput,
		@Context() context,
	) {
		return this.attribsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Attrib, { name: 'updateAttrib' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateAttribInput')
		_: UpdateAttribInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.attribsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}
