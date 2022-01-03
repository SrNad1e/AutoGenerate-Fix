import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEmpty } from 'class-validator';

@Injectable()
export class ParseIntPipe implements PipeTransform {
	transform(value?: string) {
		if (!value) {
			return null;
		}

		const val = parseInt(value, 10);

		if (isNaN(val)) {
			throw new BadRequestException(`${value} no es un número`);
		}

		return value;
	}
}
