import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

	getUserId(id: number) {
		return this.userRepo.findOne(id);
	}
}
