import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsOrderService } from './returns-order.service';

describe('ReturnInvoiceService', () => {
	let service: ReturnsOrderService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ReturnsOrderService],
		}).compile();

		service = module.get<ReturnsOrderService>(ReturnsOrderService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
