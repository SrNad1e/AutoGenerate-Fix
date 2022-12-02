import { Test, TestingModule } from '@nestjs/testing';
import { CreditHistoryService } from './credit-history.service';

describe('CreditHistoryService', () => {
  let service: CreditHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditHistoryService],
    }).compile();

    service = module.get<CreditHistoryService>(CreditHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
