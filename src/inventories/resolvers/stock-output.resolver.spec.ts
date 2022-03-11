import { Test, TestingModule } from '@nestjs/testing';
import { StockOutputResolver } from './stock-output.resolver';

describe('StockOutputResolver', () => {
  let resolver: StockOutputResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockOutputResolver],
    }).compile();

    resolver = module.get<StockOutputResolver>(StockOutputResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
