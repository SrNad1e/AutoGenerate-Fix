import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddConfigurationsParamsDto } from '../dtos/configurations.dto';
import { Configuration } from '../entities/configuration.entity';

@Injectable()
export class ConfigurationsService {
	constructor(
		@InjectModel(Configuration.name)
		private configurationModule: Model<Configuration>,
	) {}

	async getAll() {
		return this.configurationModule.find({ __v: { $ne: 0 } });
	}

	async getForName(module: string, name: string) {
		const config = await this.configurationModule.findOne({ module });

		const configSelected = config.configs.find((item) => item.name === name);

		return configSelected;
	}

	async getModule(module: string) {
		return this.configurationModule.findOne({ module });
	}

	async addConfig(module: string, config: AddConfigurationsParamsDto) {
		const configModule = await this.configurationModule.findOne({ module });
		const { configs } = configModule;
		try {
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
				return new NotFoundException(
					`La configuración ${config.name} no existe en el módulo ${module}`,
				);
			}

			return this.configurationModule.updateOne(
				{ _id: configModule._id },
				{ $set: { configs } },
				{ new: true },
			);
		} catch (e) {
			return new NotFoundException(`Error al agregar configuración, ${e}`);
		}
	}
}
