/* eslint-disable prettier/prettier */
import { Configuration } from 'src/configurations/entities/configuration.entity';

export const configurationStub = (): Configuration => {
	return {
		module: 'invoicing',
		configs: [
			{
				name: 'bonus',
				title: 'Bonificaciones',
				description: 'Bonificacion por ventas',
				data: [],
				createdAt: new Date('2022/02/16'),
				updatedAt: new Date('2022/02/16'),
			},
		],
	};
};
