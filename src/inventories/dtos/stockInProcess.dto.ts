import { Types } from 'mongoose';

export class deleteStockInProcess {
	productId: Types.ObjectId;
	documentId: Types.ObjectId;
	cost: number;
	quantity: number;
	warehouseId: Types.ObjectId;
}
export class createStockInProcess extends deleteStockInProcess {
	documentType: string;
}

export class updateStockInProcess {
	productId: Types.ObjectId;
	warehouseId: number;
	documentId: Types.ObjectId;
}

export class FiltersStockInProcess {
	productId?: Types.ObjectId;
	documentId?: Types.ObjectId;
	cost?: number;
	documentType?: string;
	quantity?: number;
	status?: string;
}
