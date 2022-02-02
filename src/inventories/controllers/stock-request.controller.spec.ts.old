import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestController } from './stock-request.controller';

describe('StockRequestController', () => {
  let controller: StockRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockRequestController],
    }).compile();

    controller = module.get<StockRequestController>(StockRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
