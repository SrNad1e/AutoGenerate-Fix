import { Injectable } from '@nestjs/common';

@Injectable()
export class RefundsService {
	getAll(data: any) {
		const { limit = 20, skip = 0, order, invoice, shop } = data;
		return `Estos son los datos de limit ${limit} y  skip ${skip}, y los demas filtros ${order?.code}, ${invoice?.number}, ${shop?.shopId}`;
	}
}
