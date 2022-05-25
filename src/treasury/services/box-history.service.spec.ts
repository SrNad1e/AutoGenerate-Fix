import { Test, TestingModule } from '@nestjs/testing';
import { BoxHistoryService } from './box-history.service';

describe('BoxHistoryService', () => {
  let service: BoxHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoxHistoryService],
    }).compile();

    service = module.get<BoxHistoryService>(BoxHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
