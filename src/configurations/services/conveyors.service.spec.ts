import { Test, TestingModule } from '@nestjs/testing';
import { ConveyorsService } from './conveyors.service';

describe('ConveyorsService', () => {
  let service: ConveyorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConveyorsService],
    }).compile();

    service = module.get<ConveyorsService>(ConveyorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
