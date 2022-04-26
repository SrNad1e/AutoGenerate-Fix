import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Image, ImageSchema } from './entities/image.entity';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Image.name,
				schema: ImageSchema,
			},
		]),
	],
})
export class StaticFilesModule {}
