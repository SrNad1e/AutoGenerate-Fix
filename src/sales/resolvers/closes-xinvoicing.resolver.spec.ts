import { Test, TestingModule } from '@nestjs/testing';
import { ClosesXinvoicingResolver } from './closes-xinvoicing.resolver';

describe('ClosesXinvoicingResolver', () => {
  let resolver: ClosesXinvoicingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosesXinvoicingResolver],
    }).compile();

    resolver = module.get<ClosesXinvoicingResolver>(ClosesXinvoicingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
