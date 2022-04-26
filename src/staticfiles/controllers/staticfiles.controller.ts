import {
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ImagesService } from '../services/images.service';

@Controller('upload')
export class StaticfilesController {
	constructor(private readonly imagesService: ImagesService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('image'))
	uploadFile(@UploadedFile() image: Express.Multer.File) {
		this.imagesService.uploadImage(image, { name: 'Temporal' });
	}
}
