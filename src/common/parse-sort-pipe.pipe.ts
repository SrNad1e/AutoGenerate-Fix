import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseSortPipePipe implements PipeTransform {
	transform(values: Record<string, string>, metadata: ArgumentMetadata) {
		const keys = Object.keys(values);
		const newValues: Record<string, number> = {};
		keys.forEach((key) => {
			newValues[key] = parseInt(values[key]);
		});

		return newValues;
	}
}
