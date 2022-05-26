import { Test, TestingModule } from '@nestjs/testing';
import { ReturnInvoiceService } from './return-invoice.service';

describe('ReturnInvoiceService', () => {
  let service: ReturnInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnInvoiceService],
    }).compile();

    service = module.get<ReturnInvoiceService>(ReturnInvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
