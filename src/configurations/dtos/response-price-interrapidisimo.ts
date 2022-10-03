class ServicePaymentMethod {
	IdServicio: number;
	IdFormaPago: number;
	Descripción: string;
	FechaEntrega: string;
}

class Price {
	Impuestos: number;
	ValorKiloInicial: number;
	ValorKiloAdicional: number;
	Valor: number;
	ValorContraPago: number;
	ValorPrimaSeguro: number;
}

export class ResponsePriceInterrapidisimo {
	IdServicio: string;
	Precio: Price;
	PrecioCarga: number;
	Mensaje: string;
	NombreServicio: string;
	TiempoEntrega: number;
	FormaPagoServicio: ServicePaymentMethod;
}
