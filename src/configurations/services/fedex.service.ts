import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { map } from 'rxjs';

import config from 'src/config';
import { GetPriceFedexInput } from '../dtos/get-price-fedex.input';
import { ResponseAuthorizationFedex } from '../dtos/response-authorization-fedex';
import { ResponsePriceFedex } from '../dtos/response-price-fedex';

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

	/**
	 * @description obtiene el precio del
	 * @param params datos para el cálculo del envío
	 * @return precio redondeado del envío
	 */
	async getPrice({ address, dimensions }: GetPriceFedexInput) {
		const { api, accountNumber, postalCode, country } =
			this.configService.FEDEX;
		const { access_token }: ResponseAuthorizationFedex =
			await this.generateAuthorization();

		const requestedPackageLineItems = dimensions.map((dimension) => ({
			weight: {
				value: dimension.weight,
				units: 'KG',
			},
			dimensions: {
				...dimension.dimensions,
				units: 'CM',
			},
		}));

		const response = (await this.httpService
			.post(
				`${api}/rate/v1/rates/quotes`,
				{
					accountNumber: {
						value: accountNumber,
					},
					requestedShipment: {
						serviceType: 'STANDARD_OVERNIGHT',
						shipper: {
							address: {
								postalCode: postalCode,
								countryCode: country,
							},
						},
						recipient: {
							address: address,
						},
						pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
						rateRequestType: ['PREFERRED'],
						requestedPackageLineItems,
					},
				},
				{
					headers: {
						'Content-Type': 'application/json',
						authorization: `Bearer ${access_token}`,
						'x-locale': 'es_MX',
					},
				},
			)
			.pipe(map((resp) => resp.data))) as unknown as ResponsePriceFedex;

		let total =
			response?.output?.rateReplyDetails[0]?.ratedShipmentDetails[1]
				?.totalNetFedExCharge || 0;

		total = Math.ceil(total);
		return Math.ceil(total / 100) * 100;
	}
}
