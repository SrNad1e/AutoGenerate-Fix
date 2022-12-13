import { Test, TestingModule } from '@nestjs/testing';
import { ClosesZinvoicingResolver } from './closes-zinvoicing.resolver';

describe('ClosesZinvoicingResolver', () => {
  let resolver: ClosesZinvoicingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosesZinvoicingResolver],
    }).compile();

    resolver = module.get<ClosesZinvoicingResolver>(ClosesZinvoicingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
