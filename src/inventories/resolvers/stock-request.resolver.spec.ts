import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestResolver } from './stock-request.resolver';

describe('StockRequestResolver', () => {
  let resolver: StockRequestResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockRequestResolver],
    }).compile();

    resolver = module.get<StockRequestResolver>(StockRequestResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
