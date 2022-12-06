import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTypeService } from './customer-type.service';

describe('CustomerTypeService', () => {
  let service: CustomerTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerTypeService],
    }).compile();

    service = module.get<CustomerTypeService>(CustomerTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
