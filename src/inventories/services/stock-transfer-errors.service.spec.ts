import { Test, TestingModule } from '@nestjs/testing';
import { StockTransferErrorsService } from './stock-transfer-errors.service';

describe('StockTransferErrorsService', () => {
  let service: StockTransferErrorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockTransferErrorsService],
    }).compile();

    service = module.get<StockTransferErrorsService>(StockTransferErrorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
