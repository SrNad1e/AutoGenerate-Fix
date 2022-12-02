import { Test, TestingModule } from '@nestjs/testing';
import { CreditHistoryResolver } from './credit-history.resolver';

describe('CreditHistoryResolver', () => {
  let resolver: CreditHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditHistoryResolver],
    }).compile();

    resolver = module.get<CreditHistoryResolver>(CreditHistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
