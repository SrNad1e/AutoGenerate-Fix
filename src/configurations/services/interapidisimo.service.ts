import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import config from 'src/config';

@Injectable()
export class InterapidisimoService {
	constructor(
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
		private readonly httpService: HttpService,
	) {}
	async getAuthorization() {
		const { api, security_token, signature } =
			this.configService.interapidisimo;
	}
}
