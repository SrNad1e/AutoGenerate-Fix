import { Test, TestingModule } from '@nestjs/testing';
import { StockOutputController } from './stock-output.controller';

describe('StockOutputController', () => {
  let controller: StockOutputController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockOutputController],
    }).compile();

    controller = module.get<StockOutputController>(StockOutputController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
