import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';

export const uploadFileAWS = async (
	dataBuffer: Buffer,
	extension: string,
	bucket: string,
) => {
	const s3 = new S3();

	return s3
		.upload({
			Bucket: bucket,
			Body: dataBuffer,
			Key: `${uuid()}.${extension}`,
		})
		.promise();
};

export const resizeImage = async (buffer: Buffer, percent: number) => {
	const image = await sharp(buffer);
	const { width, height } = await image.metadata();

	const newWidth = Math.ceil(width * (percent / 100));
	const newHeight = Math.ceil(height * (percent / 100));

	const newImage = image.resize(newWidth, newHeight, {
		fit: 'contain',
	});

	const jpeg = await newImage.jpeg().toBuffer();
	const webp = await newImage.webp().toBuffer();

	return {
		jpeg,
		webp,
	};
};
