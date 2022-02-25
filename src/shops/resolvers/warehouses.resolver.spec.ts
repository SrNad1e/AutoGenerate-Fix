import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesResolver } from './warehouses.resolver';

describe('WarehousesResolver', () => {
  let resolver: WarehousesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehousesResolver],
    }).compile();

    resolver = module.get<WarehousesResolver>(WarehousesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
