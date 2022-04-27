import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import config from 'src/config';
import { Image } from '../entities/image.entity';
import { resizeImage, uploadFileAWS } from 'src/common/aws';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ImagesService {
	constructor(
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
		@InjectModel(Image.name) private readonly imageModel: PaginateModel<Image>,
	) {}

	async uploadImage(
		{ buffer, mimetype, originalname }: Express.Multer.File,
		user: Partial<User>,
	) {
		const bucker = this.configService.AWS.publicBucketName;
		const bufferSmall = await resizeImage(buffer, 25);
		const bufferMedium = await resizeImage(buffer, 50);
		const bufferBig = await resizeImage(buffer, 150);

		const urlOriginal = await uploadFileAWS(
			buffer,
			mimetype.replace('image/', ''),
			bucker,
		);

		const urlJpegSmall = await uploadFileAWS(bufferSmall.jpeg, 'jpeg', bucker);

		const urlWebpSmall = await uploadFileAWS(bufferSmall.webp, 'webp', bucker);

		const urlJpegMedium = await uploadFileAWS(
			bufferMedium.jpeg,
			'jpeg',
			bucker,
		);

		const urlWebpMedium = await uploadFileAWS(
			bufferMedium.webp,
			'webp',
			bucker,
		);

		const urlJpegBig = await uploadFileAWS(bufferBig.jpeg, 'jpeg', bucker);

		const urlWebpBig = await uploadFileAWS(bufferBig.webp, 'webp', bucker);

		const newImage = new this.imageModel({
			name: originalname,
			urls: {
				webp: {
					small: urlWebpSmall.Key,
					medium: urlWebpMedium.Key,
					Big: urlWebpBig.Key,
				},
				jpeg: {
					small: urlJpegSmall.Key,
					medium: urlJpegMedium.Key,
					Big: urlJpegBig.Key,
				},
				original: urlOriginal.Key,
			},
			user,
		});
		const { urls } = await newImage.save();
		return urls;
	}
}
