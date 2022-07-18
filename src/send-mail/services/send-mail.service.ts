import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { User } from 'src/configurations/entities/user.entity';

@Injectable()
export class SendMailService {
	constructor(private mailerService: MailerService) {}

	async sendRecoveryPassword(user: User, token: string) {
		//const api = `https://wholesalers-qa.toulouse.com.co`;
		//const web = `https://wholesalers-wa.toulouse.com.co`;
		const web = 'http://localhost:3000';
		const api = `http://localhost:8080`;

		await this.mailerService.sendMail({
			to: user.username,
			subject: 'Restablecer contraseña',
			template: './recovery-password',
			context: {
				name: user.name,
				url: `${web}/auth/recover/${token}`,
				catalog: `${web}/catalogo`,
				api,
			},
		});
	}
}
