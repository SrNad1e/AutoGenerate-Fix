/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stock_transfer' })
export class StockTransferMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	code: string;

	@Column({ type: 'varchar' })
	status: string;

	@Column({ type: 'int' })
	warehouse_origin_id: number;

	@Column({ type: 'int' })
	warehouse_destination_id: number;

	@Column({ type: 'int' })
	origin_user_id: number;

	@Column({ type: 'int' })
	destination_user_id: number;

	@Column({ type: 'varchar' })
	observations_origin: string;

	@Column({ type: 'varchar' })
	observations_destination: string;

	@Column({ type: 'varchar' })
	observations: string;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'varchar' })
	type: string;
}
