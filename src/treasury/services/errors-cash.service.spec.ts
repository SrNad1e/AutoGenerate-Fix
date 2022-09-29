import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsCashService } from './errors-cash.service';

describe('ErrorsCashService', () => {
  let service: ErrorsCashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorsCashService],
    }).compile();

    service = module.get<ErrorsCashService>(ErrorsCashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
