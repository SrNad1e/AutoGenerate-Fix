import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateCompanyInput } from '../dtos/create-company.input';
import { FiltersCompaniesInput } from '../dtos/filters-companies.input';

import { ResponseCompanies } from '../dtos/response-companies.input';
import { UpdateCompanyInput } from '../dtos/update-company.input';
import { Company } from '../entities/company.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CompaniesService } from '../services/companies.service';

@Resolver()
export class CompaniesResolver {
	constructor(private readonly companiesService: CompaniesService) {}

	@Query(() => ResponseCompanies, {
		name: 'companies',
		description: 'Listado de las compañías',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersCompaniesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para las compañías',
		})
		_: FiltersCompaniesInput,
		@Context() context,
	) {
		return this.companiesService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Company, {
		name: 'createCompany',
		description: 'Crea una compañía',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createCompanyInput', {
			description: 'Datos para la creación de la compañía',
		})
		_: CreateCompanyInput,
		@Context() context,
	) {
		return this.companiesService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Company, {
		name: 'updateCompany',
		description: 'Actualiza una compañía',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', {
			description: 'Identificador de la compañía para actualizar',
		})
		id: string,
		@Args('updateCompanyInput', {
			description: 'Datos para actualizar la compañía',
		})
		_: UpdateCompanyInput,
		@Context() context,
	) {
		return this.companiesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}
