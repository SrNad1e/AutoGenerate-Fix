import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsInvoiceResolver } from './returns-invoice.resolver';

describe('ReturnsInvoiceResolver', () => {
  let resolver: ReturnsInvoiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnsInvoiceResolver],
    }).compile();

    resolver = module.get<ReturnsInvoiceResolver>(ReturnsInvoiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
