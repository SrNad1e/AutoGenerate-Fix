import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class Inventories {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	warehouse_id: number;

	@Column({ type: 'int' })
	product_id: number;

	@Column({ type: 'int' })
	stock: number;

	@Column({ type: 'int' })
	reserved: number;

	@Column({ type: 'int' })
	available: number;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'datetime' })
	updated_at: Date;
}
