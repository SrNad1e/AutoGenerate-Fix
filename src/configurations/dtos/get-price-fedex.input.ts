class AddressFedexInput {
	countryCode: string;
	postalCode: string;
}

class DimensionsFedexInput {
	length: number;
	width: number;
	height: number;
}

export class GetPriceFedexInput {
	address: AddressFedexInput;
	dimensions: DimensionsFedexInput;
	weight: number;
}
