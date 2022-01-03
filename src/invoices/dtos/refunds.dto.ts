import { IsNumber } from 'class-validator';

export class SearchRefund {
	readonly limit?: number;

	readonly skip?: number;

	readonly order?: { code: number };

	readonly invoice?: { number: number };

	readonly shop?: { shopId: number };
}
