import { Test, TestingModule } from '@nestjs/testing';
import { DailyClosingResolver } from './daily-closing.resolver';

describe('DailyClosingResolver', () => {
  let resolver: DailyClosingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyClosingResolver],
    }).compile();

    resolver = module.get<DailyClosingResolver>(DailyClosingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
