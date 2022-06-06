import { Test, TestingModule } from '@nestjs/testing';
import { StaticfilesController } from './staticfiles.controller';

describe('StaticfilesController', () => {
  let controller: StaticfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticfilesController],
    }).compile();

    controller = module.get<StaticfilesController>(StaticfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
