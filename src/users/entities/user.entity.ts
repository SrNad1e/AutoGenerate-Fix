/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	shop_id: number;

	@Column({ type: 'int' })
	owner_user_id: number;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'datetime' })
	created_at: Date;
}
