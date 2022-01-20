/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductMysql {
	@PrimaryGeneratedColumn()
	id: number;
}
