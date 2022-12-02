import { Test, TestingModule } from '@nestjs/testing';
import { DiscountRulesResolver } from './discount-rules.resolver';

describe('DiscountRulesResolver', () => {
  let resolver: DiscountRulesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountRulesResolver],
    }).compile();

    resolver = module.get<DiscountRulesResolver>(DiscountRulesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
