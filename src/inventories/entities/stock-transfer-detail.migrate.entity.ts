/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stock_transfer_detail' })
export class StockTransferDetailMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	product_id: number;

	@Column({ type: 'int' })
	transfer_id: number;

	@Column({ type: 'int' })
	quantity: number;

	@Column({ type: 'int' })
	quantity_confirmed: number;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'datetime' })
	updated_at: Date;
}
