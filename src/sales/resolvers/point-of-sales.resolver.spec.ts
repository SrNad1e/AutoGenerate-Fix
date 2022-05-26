import { Test, TestingModule } from '@nestjs/testing';
import { PointOfSalesResolver } from './point-of-sales.resolver';

describe('PointOfSalesResolver', () => {
  let resolver: PointOfSalesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointOfSalesResolver],
    }).compile();

    resolver = module.get<PointOfSalesResolver>(PointOfSalesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
