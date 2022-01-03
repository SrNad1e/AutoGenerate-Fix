import { Module } from '@nestjs/common';
import { CouponsService } from './services/coupons.service';
import { CouponsController } from './controllers/coupons.controller';

@Module({
	controllers: [CouponsController],
	providers: [CouponsService],
	exports: [CouponsService],
})
export class CouponsModule {}
