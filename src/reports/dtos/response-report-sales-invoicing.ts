import { Field, ObjectType } from '@nestjs/graphql';
import { Shop } from 'src/configurations/entities/shop.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';
import { CategoryLevel1 } from 'src/products/entities/category-level1.entity';
import { Payment } from 'src/treasury/entities/payment.entity';

@ObjectType({ description: 'Ventas detalladas con base a los filtros' })
class SalesReportInvoicing {
	@Field(() => Shop, { description: 'Tienda' })
	shop: Shop;

	@Field(() => CategoryLevel1, { description: 'Categoría', nullable: true })
	category?: CategoryLevel1;

	@Field(() => Number, {
		description:
			'Cantidad de productos de la categoría vendidos o cantidad de pedidos generados',
	})
	quantity: number;

	@Field(() => Number, { description: 'Valor total de la venta' })
	total: number;
}

@ObjectType({ description: 'Medios de pago' })
class PaymentsSalesReportInvoicing {
	@Field(() => Payment, { description: 'Medio de pago' })
	payment: Payment;

	@Field(() => Number, {
		description: 'Valor total recaudado con el recibo de pago',
	})
	total: number;

	@Field(() => Number, {
		description: 'Cantidad de veces de uso del medio de pago',
	})
	quantity: number;
}

@ObjectType({ description: 'Ventas de tipos de clientes' })
class CustomerSalesReportInvoicing {
	@Field(() => CustomerType, { description: 'Tipo de cliente' })
	typeCustomer: CustomerType;

	@Field(() => String, { description: 'Nombre del cliente' })
	customerName: string;

	@Field(() => String, { description: 'Numero documento del cliente' })
	document: string;

	@Field(() => Number, { description: 'Cantidad de ventas' })
	quantity: number;

	@Field(() => Number, { description: 'Valor total de las ventas' })
	total: number;
}

@ObjectType({ description: 'Resumen de ventas' })
class SummarySalesReportInvoicing {
	@Field(() => String, { description: 'Identificador de la venta' })
	idOrder: string;

	@Field(() => Number, { description: 'Cantidad de ventas' })
	quantity: number;

	@Field(() => Number, { description: 'Valor total de las ventas' })
	total: number;

	@Field(() => Number, { description: 'CMV' })
	cmv: number;

	@Field(() => Number, { description: 'Margen de ventas en porcentaje' })
	margin: number;

	@Field(() => Date, { description: 'Fecha de cierre de la venta' })
	closeDate: Date;

	@Field(() => [ProductDetail], { description: 'Productos de la venta' })
	products: ProductDetail[];
}

@ObjectType({ description: 'Detalle del producto' })
class ProductDetail {
	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Field(() => Number, { description: 'Costo del producto' })
	cost: number;

	@Field(() => String, { description: 'Nombre del producto' })
	name: string;

	@Field(() => String, { description: 'Codigo de barras del producto' })
	barcode: string;

	@Field(() => String, { description: 'Color del producto' })
	color: string;

	@Field(() => String, { description: 'Talla del producto' })
	size: string;

	@Field(() => String, { description: 'Marca del producto' })
	brand: string;

	@Field(() => String, {
		description: 'Categoria nivel 1 del producto',
	})
	categoryLevel1: string;
}

@ObjectType({ description: 'Reportde de ventas generales' })
export class ResponseReportSalesInvoicing {
	@Field(() => [SalesReportInvoicing], {
		description: 'Ventas detalladas',
		nullable: true,
	})
	salesReport?: SalesReportInvoicing[];

	@Field(() => [PaymentsSalesReportInvoicing], {
		description: 'Medios de pago',
		nullable: true,
	})
	paymentsSalesReport?: PaymentsSalesReportInvoicing[];

	@Field(() => [CustomerSalesReportInvoicing], {
		description: 'Ventas por tipo de cliente',
		nullable: true,
	})
	customersSalesReport?: CustomerSalesReportInvoicing[];

	@Field(() => SummarySalesReportInvoicing, {
		description: 'Resumen de ventas',
		nullable: true,
	})
	summarySalesReport?: SummarySalesReportInvoicing;
}
