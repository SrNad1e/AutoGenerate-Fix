/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { Coupon, CouponSchema } from './entities/coupon.entity';
import { CouponsController } from './controllers/coupons.controller';
import { CouponsService } from './services/coupons.service';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Coupon.name,
				useFactory: async (connection: Connection) => {
					const schema = CouponSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'coupon_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
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
