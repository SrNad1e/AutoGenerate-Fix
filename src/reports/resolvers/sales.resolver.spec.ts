import { Test, TestingModule } from '@nestjs/testing';
import { SalesResolver } from './sales.resolver';

describe('SalesResolver', () => {
  let resolver: SalesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesResolver],
    }).compile();

    resolver = module.get<SalesResolver>(SalesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
