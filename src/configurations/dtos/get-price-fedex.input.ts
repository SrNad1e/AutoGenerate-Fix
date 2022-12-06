class AddressFedexInput {
	countryCode: string;
	postalCode: string;
}

class DimensionsFedexInput {
	length: number;
	width: number;
	height: number;
}

class Dimensions {
	weight: number;
	dimensions: DimensionsFedexInput;
}

export class GetPriceFedexInput {
	address: AddressFedexInput;
	dimensions: Dimensions[];
}
