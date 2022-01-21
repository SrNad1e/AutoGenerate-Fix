import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestService } from './stock-request.service';

describe('StockRequestService', () => {
  let service: StockRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockRequestService],
    }).compile();

    service = module.get<StockRequestService>(StockRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
