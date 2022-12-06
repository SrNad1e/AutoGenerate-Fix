import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsResolver } from './receipts.resolver';

describe('ReceiptsResolver', () => {
  let resolver: ReceiptsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptsResolver],
    }).compile();

    resolver = module.get<ReceiptsResolver>(ReceiptsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
