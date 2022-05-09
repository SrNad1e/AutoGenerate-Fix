import { Test, TestingModule } from '@nestjs/testing';
import { CitiesResolver } from './cities.resolver';

describe('CitiesResolver', () => {
  let resolver: CitiesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitiesResolver],
    }).compile();

    resolver = module.get<CitiesResolver>(CitiesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
