/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { configurationStub } from '../stubs/configuration.stub';
import { Configuration, Configs } from '../entities/configuration.entity';
import { ConfigurationsService } from '../services/configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { AddConfigurationsDto } from '../dtos/configurations.dto';

jest.mock('../services/configurations.service');

describe('ConfigurationsController', () => {
	let configurationsController: ConfigurationsController;
	let configurationsService: ConfigurationsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [ConfigurationsController],
			providers: [ConfigurationsService],
		}).compile();

		configurationsController = module.get<ConfigurationsController>(
			ConfigurationsController,
		);
		configurationsService = module.get<ConfigurationsService>(
			ConfigurationsService,
		);
		jest.clearAllMocks();
	});

	describe('getAll', () => {
		describe('cuando se llama a getAll', () => {
			let configurations: Configuration[];

			beforeEach(async () => {
				configurations = await configurationsController.getAll();
			});

			test('debería llamar el servicio', () => {
				expect(configurationsService.getAll).toHaveBeenCalled();
			});
			test('deberia devolver un array de módulos de configuración', () => {
				expect(configurations).toEqual([configurationStub()]);
			});
		});
	});

	describe('getForName', () => {
		describe('cuando se llama a getForName', () => {
			let configs: Configs;

			beforeEach(async () => {
				configs = await configurationsController.getName(
					configurationStub().configs[0].name,
					configurationStub().module,
				);
			});

			test('debería llamar el servicio', () => {
				expect(configurationsService.getForName).toBeCalledWith(
					configurationStub().module,
					configurationStub().configs[0].name,
				);
			});
			test('deberia devolver una configuración del módulo', () => {
				expect(configs).toEqual(configurationStub().configs[0]);
			});
		});
	});

	describe('getModule', () => {
		describe('cuando se llama a getModule', () => {
			let configuration: Configuration;

			beforeEach(async () => {
				configuration = await configurationsController.getModule(
					configurationStub().module,
				);
			});

			test('debería llamar el servicio', () => {
				expect(configurationsService.getModule).toBeCalledWith(
					configurationStub().module,
				);
			});
			test('deberia devolver un módulo de configuración', () => {
				expect(configuration).toEqual(configurationStub());
			});
		});
	});

	describe('addConfig', () => {
		describe('cuando se llama a addConfig', () => {
			let configuration: Configuration;
			let addConfigurationsDto: AddConfigurationsDto;

			beforeEach(async () => {
				addConfigurationsDto = {
					name: configurationStub().configs[0].name,
					title: configurationStub().configs[0].title,
					description: configurationStub().configs[0].description,
					data: configurationStub().configs[0].data,
				};

				configuration = await configurationsController.addConfig(
					addConfigurationsDto,
					configurationStub().module,
				);
			});

			test('debería llamar el servicio', () => {
				expect(configurationsService.addConfig).toHaveBeenCalledWith(
					configurationStub().module,
					addConfigurationsDto,
				);
			});
			test('deberia devolver un módulo de configuración', () => {
				expect(configuration).toEqual(configurationStub());
			});
		});
	});

	it('deberían estar definidos el controlador y el servicio', () => {
		expect(configurationsController).toBeDefined();
		expect(configurationsService).toBeDefined();
	});
});
