/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = new DocumentBuilder()
		.setTitle('API - Toulouse')
		.setDescription('API Documentation ERP')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	app.enableCors();

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);
	await app.listen(process.env.PORT);
}
bootstrap();
