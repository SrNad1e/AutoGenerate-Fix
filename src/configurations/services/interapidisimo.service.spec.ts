import { Test, TestingModule } from '@nestjs/testing';
import { InterapidisimoService } from './interapidisimo.service';

describe('InterapidisimoService', () => {
  let service: InterapidisimoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterapidisimoService],
    }).compile();

    service = module.get<InterapidisimoService>(InterapidisimoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
