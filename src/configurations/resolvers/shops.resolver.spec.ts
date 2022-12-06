import { Test, TestingModule } from '@nestjs/testing';
import { ShopsResolver } from './shops.resolver';

describe('ShopsResolver', () => {
  let resolver: ShopsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopsResolver],
    }).compile();

    resolver = module.get<ShopsResolver>(ShopsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
