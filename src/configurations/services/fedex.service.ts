import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import config from 'src/config';
import { GetPriceFedexInput } from '../dtos/get-price-fedex.input';
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
	async generateAuthorization(): Promise<ResponseAuthorizationFedex> {
		const { api, client_id, client_secret } = this.configService.FEDEX;
		const params = new URLSearchParams();
		params.append('grant_type', 'client_credentials');
		params.append('client_id', client_id);
		params.append('client_secret', client_secret);
		try {
			const response = await this.httpService.axiosRef.post(
				`${api}/oauth/token`,
				params,
			);
			return response.data;
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

		let requestedPackageLineItems = dimensions.map((dimension) => ({
			weight: {
				value: dimension.weight,
				units: 'KG',
			},
			dimensions: {
				...dimension.dimensions,
				units: 'CM',
			},
		}));
		requestedPackageLineItems = requestedPackageLineItems.filter(
			({ weight }) => weight.value > 0,
		);

		try {
			const response = await this.httpService.axiosRef.post(
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
						preferredCurrency: 'COP',
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
			);

			let total =
				response?.data?.output?.rateReplyDetails[0]?.ratedShipmentDetails[1]
					?.totalNetFedExCharge || 0;

			total = Math.ceil(total);
			return Math.ceil(total / 100) * 100;
		} catch (e) {
			throw new Error('Error en servidor FEDEX');
		}
	}
}
