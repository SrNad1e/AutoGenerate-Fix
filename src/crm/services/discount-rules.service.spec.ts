import { Test, TestingModule } from '@nestjs/testing';
import { DiscountRulesService } from './discount-rules.service';

describe('DiscountRulersService', () => {
	let service: DiscountRulesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DiscountRulesService],
		}).compile();

		service = module.get<DiscountRulesService>(DiscountRulesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
