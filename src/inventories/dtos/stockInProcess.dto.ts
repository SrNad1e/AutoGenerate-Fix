/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongoose';
export class deleteStockInProcess {
	productId: ObjectId;
	documentId: ObjectId;
	cost: number;
	quantity: number;
	warehouseId: ObjectId;
}
export class createStockInProcess extends deleteStockInProcess {
	documentType: string;
}

export class updateStockInProcess {
	productId: ObjectId;
	warehouseId: number;
	documentId: ObjectId;
}
