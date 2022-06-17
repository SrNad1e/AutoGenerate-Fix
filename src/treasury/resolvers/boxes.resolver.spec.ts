import { Test, TestingModule } from '@nestjs/testing';
import { BoxesResolver } from './boxes.resolver';

describe('BoxesResolver', () => {
  let resolver: BoxesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoxesResolver],
    }).compile();

    resolver = module.get<BoxesResolver>(BoxesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
