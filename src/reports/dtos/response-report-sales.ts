import { Field, ObjectType } from '@nestjs/graphql';
import { Shop } from 'src/configurations/entities/shop.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';
import { CategoryLevel1 } from 'src/products/entities/category-level1.entity';
import { Payment } from 'src/treasury/entities/payment.entity';

@ObjectType({ description: 'Ventas detalladas con base a los filtros' })
class SalesReport {
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
class PaymentsSalesReport {
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
class CustomerSalesReport {
	@Field(() => CustomerType, { description: 'Tipo de cliente' })
	typeCustomer: CustomerType;

	@Field(() => Number, { description: 'Cantidad de ventas' })
	quantity: number;

	@Field(() => Number, { description: 'Valor total de las ventas' })
	total: number;
}

@ObjectType({ description: 'Resumen de ventas' })
class SummarySalesReport {
	@Field(() => Number, { description: 'Cantidad de ventas' })
	quantity: number;

	@Field(() => Number, { description: 'Valor total de las ventas' })
	total: number;

	@Field(() => Number, { description: 'CMV' })
	cmv: number;

	@Field(() => Number, { description: 'Margen de ventas en porcentaje' })
	margin: number;
}

@ObjectType({ description: 'Reportde de ventas generales' })
export class ResponseReportSales {
	@Field(() => [SalesReport], {
		description: 'Ventas detalladas',
		nullable: true,
	})
	salesReport?: SalesReport[];

	@Field(() => [PaymentsSalesReport], {
		description: 'Medios de pago',
		nullable: true,
	})
	paymentsSalesReport?: PaymentsSalesReport[];

	@Field(() => [CustomerSalesReport], {
		description: 'Ventas por tipo de cliente',
		nullable: true,
	})
	customersSalesReport?: CustomerSalesReport[];

	@Field(() => SummarySalesReport, {
		description: 'Resumen de ventas',
		nullable: true,
	})
	summarySalesReport?: SummarySalesReport;
}
