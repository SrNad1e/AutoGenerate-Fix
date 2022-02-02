/* eslint-disable prettier/prettier */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Document, ObjectId } from 'mongoose';
import { ConfigurationsModule } from '../configurations.module';
import { Configuration } from '../entities/configuration.entity';
import { ConfigurationsService } from '../services/configurations.service';
import { ConfigurationsController } from './configurations.controller';

describe('ConfigurationsController', () => {
	let configurationsController: ConfigurationsController;
	let configurationsService: ConfigurationsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigurationsModule],
		})
			.overrideProvider(getModelToken(Configuration.name))
			.useValue(jest.fn())
			.compile();

		configurationsController = module.get<ConfigurationsController>(
			ConfigurationsController,
		);
		configurationsService = module.get<ConfigurationsService>(
			ConfigurationsService,
		);
	});

	describe('getAll', () => {
		it('must return an Array of type ConfigurationSerializer', async () => {
			jest
				.spyOn(configurationsService, 'getAll')
				.mockImplementation(() =>
					Promise.resolve([
						{ name: 'example', title: 'example' },
					] as unknown as Promise<
						(Document<any, any, Configuration> &
							Configuration & { _id: ObjectId })[]
					>),
				);
			const result = await configurationsController.getAll();

			expect(result).toHaveLength(1);
			expect(result instanceof ).toEqual(true);
			expect(configurationsService.getAll).toHaveBeenCalledTimes(1);
		});
	});

	it('should be defined', () => {
		expect(configurationsController).toBeDefined();
	});
});
