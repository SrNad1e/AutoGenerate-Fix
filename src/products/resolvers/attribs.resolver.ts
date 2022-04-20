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

	@Query(() => ResponseAttribs, {
		name: 'attribs',
		description: 'Listado de atributos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersAttribsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para listar los atributos',
		})
		_: FiltersAttribsInput,
		@Context() context,
	) {
		return this.attribsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Attrib, {
		name: 'createAttrib',
		description: 'Crea un atributo',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createAttribInput', { description: 'Datos para crear un atributo' })
		_: CreateAttribInput,
		@Context() context,
	) {
		return this.attribsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Attrib, {
		name: 'updateAttrib',
		description: 'Actualiza un atributo',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador del atributo a actualizar' })
		id: string,
		@Args('updateAttribInput', {
			description: 'Datos a actualizar en el atributo',
		})
		_: UpdateAttribInput,
		@Context() context,
	) {
		return this.attribsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}
