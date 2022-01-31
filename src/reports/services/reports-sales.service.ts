/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { ConfigurationsService } from 'src/configurations/services/configurations.service';
import { InvoicesService } from 'src/invoices/services/invoices.service';
import { ShopsService } from 'src/shops/services/shops.service';

@Injectable()
export class ReportsSalesService {
	constructor(
		private invoicesService: InvoicesService,
		private configurationsService: ConfigurationsService,
		private shopsService: ShopsService,
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
			const shopGoal = await this.shopsService.getByIdMysql(shopId);

			//calculamos el porcentaje de la meta
			const bonus = await this.configurationsService.getForName(
				'invoicing',
				'bonus',
			);

			//calculamos el total ganado
			const superplusGoal = sales - shopGoal['_doc'].goal || 0;

			const bonusValue =
				superplusGoal > 0 ? (superplusGoal * bonus.data[0].value) / 100 : 0;

			return {
				sales,
				shopGoal: shopGoal['_doc'].goal,
				bonus: bonus.data[0].value,
				percentSales: sales / shopGoal['_doc'].goal,
				superplusGoal,
				bonusValue,
			};
		} catch (e) {
			throw new HttpException(
				`Error al crear consultar el informe ${e}`,
				HttpStatus.BAD_REQUEST,
			);
		}
	}
}
