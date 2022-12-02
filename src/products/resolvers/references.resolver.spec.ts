import { Test, TestingModule } from '@nestjs/testing';
import { ReferencesResolver } from './references.resolver';

describe('ReferencesResolver', () => {
  let resolver: ReferencesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferencesResolver],
    }).compile();

    resolver = module.get<ReferencesResolver>(ReferencesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
