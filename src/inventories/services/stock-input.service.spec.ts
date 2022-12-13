import { Test, TestingModule } from '@nestjs/testing';
import { StockInputService } from './stock-input.service';

describe('StockInputService', () => {
  let service: StockInputService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockInputService],
    }).compile();

    service = module.get<StockInputService>(StockInputService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
