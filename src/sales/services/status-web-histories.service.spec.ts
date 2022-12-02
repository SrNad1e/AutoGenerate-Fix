import { Test, TestingModule } from '@nestjs/testing';
import { StatusWebHistoriesService } from './status-web-histories.service';

describe('StatusWebHistoriesService', () => {
  let service: StatusWebHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusWebHistoriesService],
    }).compile();

    service = module.get<StatusWebHistoriesService>(StatusWebHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
