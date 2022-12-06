import { Test, TestingModule } from '@nestjs/testing';
import { AttribsService } from './attribs.service';

describe('AttribsService', () => {
  let service: AttribsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttribsService],
    }).compile();

    service = module.get<AttribsService>(AttribsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
