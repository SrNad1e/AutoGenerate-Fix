import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Image, ImageSchema } from './entities/image.entity';
import { ImagesService } from './services/images.service';
import { StaticfilesController } from './controllers/staticfiles.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Image.name,
				schema: ImageSchema,
			},
		]),
	],
	providers: [ImagesService],
	controllers: [StaticfilesController],
})
export class StaticFilesModule {}
