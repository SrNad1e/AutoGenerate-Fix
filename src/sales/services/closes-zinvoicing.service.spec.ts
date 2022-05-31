import { Test, TestingModule } from '@nestjs/testing';
import { ClosesZinvoicingService } from './closes-zinvoicing.service';

describe('ClosesZinvoicingService', () => {
  let service: ClosesZinvoicingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosesZinvoicingService],
    }).compile();

    service = module.get<ClosesZinvoicingService>(ClosesZinvoicingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
