import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseSortPipePipe implements PipeTransform {
	transform(values: string, metadata: ArgumentMetadata) {
		if (values) {
			const valuesJson = JSON.parse(values);
			const keys = Object.keys(valuesJson);

			const newValues: Record<string, number> = {};
			keys.reverse().forEach((key) => {
				newValues[key] = parseInt(valuesJson[key]);
			});

			return newValues;
		} else {
			return values;
		}
	}
}
