import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigType } from '@nestjs/config';

import config from 'src/config';
import { join } from 'path';
import { SendMailService } from './services/send-mail.service';

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { host, password, port, secure, user } = configService.nodemailer;
				return {
					transport: {
						host,
						secure: secure === 'true',
						port: parseInt(port),
						auth: {
							user,
							pass: password,
						},
					},
					defaults: {
						from: user,
					},
					template: {
						dir: join(__dirname, 'templates'),
						adapter: new HandlebarsAdapter(),
						options: {
							strict: true,
						},
					},
				};
			},
			inject: [config.KEY],
		}),
	],
	providers: [SendMailService],
	exports: [SendMailService],
})
export class SendMailModule {}
