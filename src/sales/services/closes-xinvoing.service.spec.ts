import { Test, TestingModule } from '@nestjs/testing';
import { ClosesXinvoingService } from './closes-xinvoing.service';

describe('ClosesXinvoingService', () => {
  let service: ClosesXinvoingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosesXinvoingService],
    }).compile();

    service = module.get<ClosesXinvoingService>(ClosesXinvoingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
