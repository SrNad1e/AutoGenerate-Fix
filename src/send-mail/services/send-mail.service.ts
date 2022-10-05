import { MailerService } from '@nestjs-modules/mailer';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import { User } from 'src/configurations/entities/user.entity';
import config from 'src/config';

@Injectable()
export class SendMailService {
	constructor(
		private readonly mailerService: MailerService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async sendRecoveryPassword(user: User, token: string) {
		//const web = 'http://localhost:3000';
		//const api = `http://localhost:8080`;
		try {
			await this.mailerService.sendMail({
				to: user.username,
				subject: 'Restablecer contraseña',
				template: './recovery-password',
				context: {
					name: user.name,
					url: `${this.configService.API_WEB}/auth/recover/${token}`,
					catalog: `${this.configService.API_WEB}/catalogo`,
					api: this.configService.API_URL,
				},
			});
		} catch (e) {}
	}
}
