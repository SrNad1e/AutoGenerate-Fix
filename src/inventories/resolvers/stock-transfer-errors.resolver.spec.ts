import { Test, TestingModule } from '@nestjs/testing';
import { StockTransferErrorsResolver } from './stock-transfer-errors.resolver';

describe('StockTransferErrorsResolver', () => {
  let resolver: StockTransferErrorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockTransferErrorsResolver],
    }).compile();

    resolver = module.get<StockTransferErrorsResolver>(StockTransferErrorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
