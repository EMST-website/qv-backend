import { Test, TestingModule } from '@nestjs/testing';
import { WebinarsController } from './webinars.controller';

describe('WebinarsController', () => {
  let controller: WebinarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebinarsController],
    }).compile();

    controller = module.get<WebinarsController>(WebinarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
