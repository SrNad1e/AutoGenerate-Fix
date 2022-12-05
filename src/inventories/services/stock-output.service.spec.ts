import { Test, TestingModule } from '@nestjs/testing';
import { StockOutputService } from './stock-output.service';

describe('StockOutputService', () => {
  let service: StockOutputService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockOutputService],
    }).compile();

    service = module.get<StockOutputService>(StockOutputService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
