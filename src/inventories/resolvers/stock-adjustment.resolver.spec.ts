import { Test, TestingModule } from '@nestjs/testing';
import { StockAdjustmentResolver } from './stock-adjustment.resolver';

describe('StockAdjustmentResolver', () => {
  let resolver: StockAdjustmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockAdjustmentResolver],
    }).compile();

    resolver = module.get<StockAdjustmentResolver>(StockAdjustmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
