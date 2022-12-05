import { Query, Args, Context, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersImagesInput } from '../../configurations/dtos/filters-images.input';
import { ResponseImages } from '../dtos/response-images';
import { ImagesService } from '../services/images.service';

@Resolver()
export class ImagesResolver {
	constructor(private readonly imagesService: ImagesService) {}

	@Query(() => ResponseImages, {
		name: 'images',
		description: 'Listado de imagenes',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_IMAGES)
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
