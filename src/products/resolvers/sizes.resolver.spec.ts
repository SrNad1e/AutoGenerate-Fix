import { Test, TestingModule } from '@nestjs/testing';
import { SizesResolver } from './sizes.resolver';

describe('SizesResolver', () => {
  let resolver: SizesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SizesResolver],
    }).compile();

    resolver = module.get<SizesResolver>(SizesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
