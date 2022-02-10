import { Test, TestingModule } from '@nestjs/testing';
import { ReportsSalesResolver } from './reports-sales.resolver';

describe('ReportsSalesResolver', () => {
  let resolver: ReportsSalesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsSalesResolver],
    }).compile();

    resolver = module.get<ReportsSalesResolver>(ReportsSalesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
