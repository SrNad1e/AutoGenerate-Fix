/* eslint-disable prettier/prettier */
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { GetConfigsArgs } from '../dtos/args/get-configs.args';
import { GetModuleConfigurationArgs } from '../dtos/args/get-module-configuration.args';
import { AddConfigInput } from '../dtos/inputs/add-config.input';
import { Configs, Configuration } from '../entities/configuration.entity';
import { ConfigurationsService } from '../services/configurations.service';

@Resolver(() => Configuration)
export class ConfigurationsResolver {
	constructor(private readonly configurationsService: ConfigurationsService) {}

	@Query(() => [Configuration])
	async getAll(): Promise<Configuration[]> {
		return this.configurationsService.getAll();
	}

	@Query(() => Configuration)
	async getForName(@Args() getConfigsArg: GetConfigsArgs): Promise<Configs> {
		return this.configurationsService.getForName(getConfigsArg);
	}

	@Query(() => Configuration, { name: 'configuration', nullable: true })
	async getModule(
		@Args() getModuleConfigurationArgs: GetModuleConfigurationArgs,
	): Promise<Configuration> {
		return this.configurationsService.getModule(getModuleConfigurationArgs);
	}

	@Mutation(() => Configuration)
	async addConfi(
		@Args('addConfigData') addConfigData: AddConfigInput,
	): Promise<Configuration> {
		return this.configurationsService.addConfigModule(addConfigData);
	}
}
