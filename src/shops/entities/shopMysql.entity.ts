/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'shops' })
export class Shop {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	owner_user_id: number;

	@Column({ type: 'varchar' })
	address: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar' })
	phone: string;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'datetime' })
	created_at: string;
}
