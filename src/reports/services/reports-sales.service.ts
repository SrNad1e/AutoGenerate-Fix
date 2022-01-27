import { Injectable, NotFoundException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { ConfigurationsService } from 'src/configurations/services/configurations.service';
import { InvoicesService } from 'src/invoices/services/invoices.service';

@Injectable()
export class ReportsSalesService {
	constructor(
		private invoicesService: InvoicesService,
		private configurationsService: ConfigurationsService,
	) {}

	async bonusForGoal(shopId: number) {
		try {
			//se organizan las fechas que cumplan con primer y ultimo dia del mes
			const dateInitial = new Date(dayjs().startOf('M').format('YYYY/MM/DD'));
			const dateFinish = new Date(dayjs().endOf('M').format('YYYY/MM/DD'));

			//seleccionar valor de las ventas
			const sales = await this.invoicesService.totalInvoicesShop(
				shopId,
				dateInitial,
				dateFinish,
			);

			//seleccionamos la meta de la tienda
			const goal = await this.configurationsService.getForName(
				'facturacion',
				'meta',
			);

			const shopGoal = goal.data.find((item) => item.shopId === shopId);

			if (shopGoal) {
				//calculamos el porcentaje de la meta
				const bonus = await this.configurationsService.getForName(
					'facturacion',
					'bonificacion',
				);

				//calculamos el total ganado
				const superplusGoal = shopGoal.value - sales;

				const bonusValue =
					superplusGoal > 0 ? (superplusGoal * bonus.data[0]) / 100 : 0;

				return {
					sales,
					shopGoal,
					bonus,
					superplusGoal,
					bonusValue,
				};
			} else {
				return new NotFoundException(
					'No existe meta para la tienda seleccionada',
				);
			}
		} catch (e) {
			return new NotFoundException(`Error al calcular el informe ${e}`);
		}
	}
}
