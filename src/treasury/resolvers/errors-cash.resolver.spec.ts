import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsCashResolver } from './errors-cash.resolver';

describe('ErrorsCashResolver', () => {
  let resolver: ErrorsCashResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorsCashResolver],
    }).compile();

    resolver = module.get<ErrorsCashResolver>(ErrorsCashResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
