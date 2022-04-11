import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<Partial<User>> {
		return await this.authService.validateUser(username, password);
	}
}
