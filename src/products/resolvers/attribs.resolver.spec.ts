import { Test, TestingModule } from '@nestjs/testing';
import { AttribsResolver } from './attribs.resolver';

describe('AttribsResolver', () => {
  let resolver: AttribsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttribsResolver],
    }).compile();

    resolver = module.get<AttribsResolver>(AttribsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
