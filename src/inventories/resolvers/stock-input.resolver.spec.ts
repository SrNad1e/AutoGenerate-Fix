import { Test, TestingModule } from '@nestjs/testing';
import { StockInputResolver } from './stock-input.resolver';

describe('StockInputResolver', () => {
  let resolver: StockInputResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockInputResolver],
    }).compile();

    resolver = module.get<StockInputResolver>(StockInputResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
