import { Test, TestingModule } from '@nestjs/testing';
import { StockTransferResolver } from './stock-transfer.resolver';

describe('StockTransferResolver', () => {
  let resolver: StockTransferResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockTransferResolver],
    }).compile();

    resolver = module.get<StockTransferResolver>(StockTransferResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
