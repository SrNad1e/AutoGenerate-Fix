/* eslint-disable prettier/prettier */
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetConfigsArgs } from '../dtos/args/get-configs.args';
import { GetModuleConfigurationArgs } from '../dtos/args/get-module-configuration.args';

import { AddConfigInput } from '../dtos/inputs/add-config.input';
import {
	Configs,
	Configuration,
} from '../entities/configuration.entity';

@Injectable()
export class ConfigurationsService {
	constructor(
		@InjectModel(Configuration.name)
		private readonly configurationModule: Model<Configuration>,
	) {}

	async getAll(): Promise<Configuration[]> {
		const configurations = await this.configurationModule
			.find({
				__v: { $ne: 0 },
			})
			.lean();
		if (configurations.length === 0) {
			throw new NotFoundException(`No existen configuraciones`);
		}
		return configurations;
	}

	async getForName({ name, module }: GetConfigsArgs): Promise<Configs> {
		if (!module || !name) {
			throw new BadRequestException(
				`Los parámetros module y name son obligatorios`,
			);
		}

		const config = await this.configurationModule.findOne({ module }).lean();
		if (!config) {
			throw new NotFoundException(`El módulo ${module} no existe`);
		}
		const configSelected = config.configs.find((item) => item.name === name);
		if (!configSelected) {
			throw new NotFoundException(
				`Configuración ${name} no encontrada en el módulo ${module}`,
			);
		}
		return configSelected;
	}

	async getModule({
		module,
	}: GetModuleConfigurationArgs): Promise<Configuration> {
		const configuration = await this.configurationModule
			.findOne({ module })
			.lean();

		if (!configuration) {
			throw new NotFoundException(`Configuración ${module} no encontrada`);
		}
		return configuration;
	}

	async addConfig({
		module,
		...config
	}: AddConfigInput): Promise<Configuration> {
		const configModule = await this.configurationModule
			.findOne({ module })
			.lean();

		if (!configModule) {
			throw new NotFoundException(`Configuración no encontrada para ${module}`);
		}

		const { configs } = configModule;

		if (configs.length === 0) {
			throw new NotFoundException(
				`No existen configuraciones para el módulo ${module}`,
			);
		}

		const configSelected = configs.findIndex(
			(item) => item.name === config.name,
		);

		if (configSelected >= 0) {
			configs[configSelected] = {
				...configs[configSelected],
				updatedAt: new Date(),
				data: config.data,
			};
		} else {
			configs.push({
				...config,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		return this.configurationModule.findByIdAndUpdate(
			configModule._id,
			{ $set: { configs } },
			{ new: true },
		);
	}
}
