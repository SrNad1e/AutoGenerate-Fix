/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductMysql {
	@PrimaryGeneratedColumn()
	id: number;
}
