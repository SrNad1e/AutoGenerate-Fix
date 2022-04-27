import { UseGuards } from '@nestjs/common';
import { Query, Args, Context, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersImagesInput } from '../dtos/filters-images.input';
import { ResponseImages } from '../dtos/response-images';
import { ImagesService } from '../services/images.service';

@Resolver()
export class ImagesResolver {
	constructor(private readonly imagesService: ImagesService) {}

	@Query(() => ResponseImages, {
		name: 'images',
		description: 'Listado de imagenes',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersImagesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para listar las imagenes',
		})
		_: FiltersImagesInput,
		@Context() context,
	) {
		return this.imagesService.findAll(context.req.body.variables.input);
	}
}
