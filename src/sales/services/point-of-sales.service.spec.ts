import { Test, TestingModule } from '@nestjs/testing';
import { PointOfSalesService } from './point-of-sales.service';

describe('PointOfSalesService', () => {
  let service: PointOfSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointOfSalesService],
    }).compile();

    service = module.get<PointOfSalesService>(PointOfSalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
