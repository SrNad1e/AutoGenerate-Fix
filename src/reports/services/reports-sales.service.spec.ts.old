import { Test, TestingModule } from '@nestjs/testing';
import { ReportsSalesService } from './reports-sales.service';

describe('ReportsSalesService', () => {
  let service: ReportsSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsSalesService],
    }).compile();

    service = module.get<ReportsSalesService>(ReportsSalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
