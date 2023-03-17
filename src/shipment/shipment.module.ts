import { Module } from '@nestjs/common';
import { ZoneService } from './services/zone.service';
import { ZoneResolver } from './resolvers/zone.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { zoneSchema } from './entities/zone.entity';
import { regionSchema } from './entities/region.entity';
import { regionService } from './services/region.service';
import { RegionResolver } from './resolvers/region.resolver';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Zone', schema: zoneSchema },
			{ name: 'Region', schema: regionSchema },
		]),
	],

	providers: [ZoneService, ZoneResolver, regionService, RegionResolver],
	exports: [ZoneService],
})
export class ShipmentModule {}
