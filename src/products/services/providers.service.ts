import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Provider, ProviderMysql } from '../entities/provider.entity';

@Injectable()
export class ProvidersService {
	constructor(
		@InjectModel(Provider.name) private readonly providerModel: Model<Provider>,
		@InjectRepository(ProviderMysql)
		private readonly providerRepo: Repository<ProviderMysql>,
	) {}

	async migration() {
		try {
			const providersMysql = await this.providerRepo.find();

			const providersMongo = providersMysql.map((provider) => ({
				id: provider.id,
				name: provider.name,
			}));

			await this.providerModel.create(providersMongo);
			return {
				message: 'Migración correcta',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar proveedores, ${e}`);
		}
	}

	async getByIdMysql(id: number) {
		return this.providerModel.findOne({ id });
	}
}
