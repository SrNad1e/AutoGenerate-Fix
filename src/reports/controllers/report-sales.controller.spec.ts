import { Test, TestingModule } from '@nestjs/testing';
import { ReportSalesController } from './report-sales.controller';

describe('ReportSalesController', () => {
  let controller: ReportSalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportSalesController],
    }).compile();

    controller = module.get<ReportSalesController>(ReportSalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
