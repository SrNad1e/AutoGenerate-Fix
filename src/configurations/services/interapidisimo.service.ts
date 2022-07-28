import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as dayjs from 'dayjs';

import config from 'src/config';
import { GetPriceInterrapidismoInput } from '../dtos/get-price-interrapidisimo.input';
import { ResponseAuthorizationInterrapidisimo } from '../dtos/response-authorization-interapidisimo';
import { ResponsePriceInterrapidisimo } from '../dtos/response-price-interrapidisimo';

@Injectable()
export class InterapidisimoService {
	constructor(
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
		private readonly httpService: HttpService,
	) {}

	types = [
		{
			code: 3,
			min: 0,
			max: 20,
		},
		{
			code: 4,
			min: 0,
			max: 1000,
		},
		{
			code: 5,
			min: 40,
			max: 50,
		},
		{
			code: 6,
			min: 60,
			max: 7000,
		},
	];

	/**
	 * @description obtiene la autorización de interrapidisimo
	 * @returns token de autorización para los consumos
	 */
	async generateAuthorization(): Promise<ResponseAuthorizationInterrapidisimo> {
		const { Authorization } = this.configService.interapidisimo;

		try {
			/*const response = await this.httpService.axiosRef.get(
				`${api}/Autorizacion/token`,
				{
					params,
					headers: {
						'x-app-signature': signature,
						Authorization: security_token,
					},
				},
			);*/
			//TODO: en espera porque api den pruebas esta dando problemas
			return {
				Access_token: Authorization,
				ExpiresIn: 500000,
				Token_tipe: 'bearer',
			};
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async getPrice({
		cityId,
		shippingInsurance,
		total,
		weight,
	}: GetPriceInterrapidismoInput) {
		const { api, signature, city_default, client_id } =
			this.configService.interapidisimo;

		const { Access_token }: ResponseAuthorizationInterrapidisimo =
			await this.generateAuthorization();

		const typeSent = await this.types.find(
			(type) => type.max >= weight && type.min <= weight,
		);

		const url = `${api}/ApiServInterStg/api/Cotizadorcliente/ResultadoListaCotizar/${client_id}/${city_default}/${cityId}/${Math.ceil(
			weight,
		)}/${shippingInsurance ? Math.ceil(total) : 0}/${
			typeSent.code
		}/${dayjs().format('DD-MM-YYYY')}`;

		const headers = {
			'x-app-signature': signature,
			'x-app-security_token': Access_token,
		};

		console.log(url);
		console.log(headers);

		try {
			const response: { data: ResponsePriceInterrapidisimo } =
				await this.httpService.axiosRef.get(url, {
					headers,
				});
			console.log('response', response.data);
			let totalPay = response.data.Precio.Valor;
			totalPay = Math.ceil(totalPay);
			return Math.ceil(totalPay / 100) * 100;
		} catch (e) {
			console.log(e.message);
			console.log(e.response.data);

			throw new Error('Error en servidor Interrapidisimo');
		}
	}
}
