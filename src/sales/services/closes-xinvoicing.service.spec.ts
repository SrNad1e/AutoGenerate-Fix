import { Test, TestingModule } from '@nestjs/testing';
import { ClosesXInvoicingService } from './closes-xinvoicing.service';

describe('ClosesXinvoicingService', () => {
	let service: ClosesXInvoicingService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ClosesXInvoicingService],
		}).compile();

		service = module.get<ClosesXInvoicingService>(ClosesXInvoicingService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
