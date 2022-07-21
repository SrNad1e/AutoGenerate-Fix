import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { map } from 'rxjs';

import config from 'src/config';
import { ResponseAuthorizationFedex } from '../dtos/response-authorization-fedex';

@Injectable()
export class FedexService {
	constructor(
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
		private readonly httpService: HttpService,
	) {}

	/**
	 * @description obtiene la autorización de fedex
	 * @returns token de autorización para los consumos
	 */
	async generateAuthorization(): Promise<ResponseAuthorizationFedex | any> {
		const { api, client_id, client_secret } = this.configService.FEDEX;

		try {
			return this.httpService
				.post(`${api}/oauth/token`, {
					grant_type: 'client_credentials',
					client_id,
					client_secret,
				})
				.pipe(map((resp) => resp.data));
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async getPrice() {
		const { access_token }: ResponseAuthorizationFedex =
			await this.generateAuthorization();
	}
}
