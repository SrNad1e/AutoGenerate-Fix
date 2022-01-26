import { Test, TestingModule } from '@nestjs/testing';
import { StockInputController } from './stock-input.controller';

describe('StockInputController', () => {
  let controller: StockInputController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockInputController],
    }).compile();

    controller = module.get<StockInputController>(StockInputController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
