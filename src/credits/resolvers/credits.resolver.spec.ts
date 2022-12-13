import { Test, TestingModule } from '@nestjs/testing';
import { CreditsResolver } from './credits.resolver';

describe('CreditsResolver', () => {
  let resolver: CreditsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditsResolver],
    }).compile();

    resolver = module.get<CreditsResolver>(CreditsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
