import { Test, TestingModule } from '@nestjs/testing';
import { DailyClosingService } from './daily-closing.service';

describe('DailyClosingService', () => {
  let service: DailyClosingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyClosingService],
    }).compile();

    service = module.get<DailyClosingService>(DailyClosingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
