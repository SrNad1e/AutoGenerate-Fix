import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTypesResolver } from './customer-types.resolver';

describe('CustomerTypesResolver', () => {
  let resolver: CustomerTypesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerTypesResolver],
    }).compile();

    resolver = module.get<CustomerTypesResolver>(CustomerTypesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
