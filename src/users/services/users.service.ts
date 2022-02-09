import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserInput } from '../dtos/update-user.input';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async findAll(): Promise<User[]> {
		const user = await this.userModel.find().populate('role').lean();
		return user;
	}

	async findOne(username: string): Promise<any> {
		return this.userModel.findOne({ username }).populate('role').lean();
	}

	async findById(id: string): Promise<User> {
		const user = await this.userModel.findById(id).populate('role').lean();
		if (!user) {
			throw new NotFoundException(`Usuario con id ${id} no existe`);
		}
		return user;
	}

	async getUserId(id: number): Promise<User> {
		const user = await this.userModel.findOne({ id }).populate('role').lean();
		if (!user) {
			throw new NotFoundException(`Usuario con idMysql ${id} no existe`);
		}
		return user;
	}

	async create(user: Partial<User>): Promise<User> {
		const newUser = new this.userModel({
			...user,
		});
		return (await newUser.save()).populate('role');
	}

	async update(
		id: string,
		updateUserInput: UpdateUserInput,
		userUpdate: User,
	): Promise<User> {
		const user = this.findById(id);
		if (!user) {
			throw new NotFoundException(`Usuario que intenta actualizar no existe`);
		}
		return this.userModel.findByIdAndUpdate(
			id,
			{
				$set: {
					...updateUserInput,
					user: userUpdate,
				},
			},
			{ new: true },
		);
	}
}
