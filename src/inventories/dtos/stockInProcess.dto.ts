/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongoose';

export class createStockInProcess {
	documentType: string;
	productId: ObjectId;
	cost: number;
	quantity: number;
	warehouseId: ObjectId;
}
