import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsOrderResolver } from './returns-order.resolver';

describe('ReturnsInvoiceResolver', () => {
	let resolver: ReturnsOrderResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ReturnsOrderResolver],
		}).compile();

		resolver = module.get<ReturnsOrderResolver>(ReturnsOrderResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
