import { Module } from '@nestjs/common';
import { CouponsService } from './services/coupons.service';
import { CouponsController } from './controllers/coupons.controller';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './entities/coupon.entity';
import { Connection } from 'mongoose';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Coupon.name,
				useFactory: async (connection: Connection) => {
					const schema = CouponSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, { inc_field: 'number' });
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
	],
	controllers: [CouponsController],
	providers: [CouponsService],
	exports: [CouponsService],
})
export class CouponsModule {}
