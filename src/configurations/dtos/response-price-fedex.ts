class Alert {
	code: string;
	message: string;
	alertType: string;
}

class SurCharge {
	type: string;
	description: string;
	amount: number;
}
class TotalBillingWeight {
	units: string;
	value: number;
}

class ShipmentRateDetail {
	rateZone: string;
	dimDivisor: number;
	fuelSurchargePercent: number;
	totalSurcharges: number;
	totalFreightDiscount: number;
	surCharges: SurCharge[];
	pricingCode: string;
	totalBillingWeight: TotalBillingWeight;
	dimDivisorType: string;
	currency: string;
	rateScale: string;
}

class RatedShipmentDetail {
	rateType: string;
	ratedWeightMethod: string;
	totalDiscounts: number;
	totalBaseCharge: number;
	totalNetCharge: number;
	totalNetFedExCharge: number;
	shipmentRateDetail: ShipmentRateDetail;
	currency: string;
}

class OperationalDetail {
	ineligibleForMoneyBackGuarantee: boolean;
	astraDescription: string;
	airportId: string;
	serviceCode: string;
}

class Name {
	type: string;
	encoding: string;
	value: string;
}

class ServiceDescription {
	serviceId: string;
	serviceType: string;
	code: string;
	names: Name[];
	serviceCategory: string;
	description: string;
	astraDescription: string;
}

class RateReplyDetail {
	serviceType: string;
	serviceName: string;
	packagingType: string;
	ratedShipmentDetails: RatedShipmentDetail[];
	operationalDetail: OperationalDetail;
	signatureOptionType: string;
	serviceDescription: ServiceDescription;
}

class Output {
	alerts: Alert[];
	rateReplyDetails: RateReplyDetail[];
	quoteDate: string;
	encoded: boolean;
}

export class ResponsePriceFedex {
	transactionId: string;
	output: Output;
}
