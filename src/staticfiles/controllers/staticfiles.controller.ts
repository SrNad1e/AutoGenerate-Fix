import {
	Controller,
	Post,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { ImagesService } from '../services/images.service';
import { JwtRestAuthGuard } from 'src/users/guards/jwt-rest-auth.guard';

@Controller('upload')
export class StaticfilesController {
	constructor(private readonly imagesService: ImagesService) {}

	@UseInterceptors(FileInterceptor('image'))
	@UseGuards(JwtRestAuthGuard)
	@Post('image')
	uploadFile(@UploadedFile() image: Express.Multer.File, @Request() req) {
		return this.imagesService.uploadImage(image, req.user);
	}
}