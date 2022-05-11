import { Test, TestingModule } from '@nestjs/testing';
import { ConveyorsResolver } from './conveyors.resolver';

describe('ConveyorsResolver', () => {
  let resolver: ConveyorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConveyorsResolver],
    }).compile();

    resolver = module.get<ConveyorsResolver>(ConveyorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
