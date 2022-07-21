import { Test, TestingModule } from '@nestjs/testing';
import { FedexService } from './fedex.service';

describe('FedexService', () => {
  let service: FedexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FedexService],
    }).compile();

    service = module.get<FedexService>(FedexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
