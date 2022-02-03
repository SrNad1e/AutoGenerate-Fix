/* eslint-disable prettier/prettier */
import { configurationStub } from '../../stubs/configuration.stub';

export const ConfigurationsService = jest.fn().mockReturnValue({
	getAll: jest.fn().mockResolvedValue([configurationStub()]),
	getForName: jest.fn().mockResolvedValue(configurationStub().configs[0]),
	getModule: jest.fn().mockResolvedValue(configurationStub()),
	addConfig: jest.fn().mockResolvedValue(configurationStub()),
});
