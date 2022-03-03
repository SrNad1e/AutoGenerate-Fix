import { Test, TestingModule } from '@nestjs/testing';
import { ColorsResolver } from './colors.resolver';

describe('ColorsResolver', () => {
  let resolver: ColorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColorsResolver],
    }).compile();

    resolver = module.get<ColorsResolver>(ColorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
