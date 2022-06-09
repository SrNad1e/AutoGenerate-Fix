import { Test, TestingModule } from '@nestjs/testing';
import { DiscountRulersService } from './discount-rulers.service';

describe('DiscountRulersService', () => {
  let service: DiscountRulersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountRulersService],
    }).compile();

    service = module.get<DiscountRulersService>(DiscountRulersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
