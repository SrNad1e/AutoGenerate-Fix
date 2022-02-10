/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ConfigurationsService } from 'src/configurations/services/configurations.service';
import { InvoicesService } from 'src/invoices/services/invoices.service';
import { ShopsService } from 'src/shops/services/shops.service';
import { ReportSalesResponse } from '../dtos/report-sales-response';

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
			const dateInitial = new Date(moment().startOf('M').format('YYYY/MM/DD'));
			const dateFinish = new Date(moment().endOf('M').format('YYYY/MM/DD'));

			//seleccionar valor de las ventas
			const sales = await this.invoicesService.totalInvoicesShop(
				shopId,
				dateInitial,
				dateFinish,
			);

			//seleccionamos la meta de la tienda
			const shopGoal = await this.shopsService.getByIdMysql(shopId);

			//calculamos el porcentaje de la meta
			const bonus = await this.configurationsService.getForName({
				module: 'invoicing',
				name: 'bonus',
			});

			//calculamos el total ganado
			const superplusGoal = sales - shopGoal['_doc'].goal || 0;

			const bonusValue =
				superplusGoal > 0
					? (superplusGoal * (bonus?.data[0]?.value as number)) / 100
					: 0;

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

	async generateReportSales(year: number): Promise<ReportSalesResponse[]> {
		//obtener el primer dia del año ISO
		const firstDayYear = this.getFirstDayYear(year).format('YYYY/MM/DD');
		const isLeapYear = this.IsLeapYear(year);

		//obtener tiendas activas
		let salesReport: Partial<ReportSalesResponse[]> = ([] = (
			await this.shopsService.getAll({ status: 'active' })
		).data.map((shop) => ({ shop, weeks: [] })));

		//generar rangos de fecha y consultar
		for (let i = 0; i < 52; i++) {
			//obtener rango de fechas
			const dateInitial = moment(firstDayYear, 'YYYY/MM/DD').add(i * 7, 'd');
			let dateFinish;

			if (i === 51) {
				if (isLeapYear) {
					dateFinish = moment(firstDayYear, 'YYYY/MM/DD').add(
						(i + 1) * 7 + 2,
						'd',
					);
				} else {
					dateFinish = moment(firstDayYear, 'YYYY/MM/DD').add(
						(i + 1) * 7 + 1,
						'd',
					);
				}
			} else {
				dateFinish = moment(firstDayYear, 'YYYY/MM/DD').add((i + 1) * 7, 'd');
			}

			//consultar las ventas nuevas
			const data = await this.invoicesService.salesForShop(
				dateInitial.toDate(),
				dateFinish.toDate(),
			);
			salesReport = salesReport.map((item) => {
				const total =
					data.find((dato) => dato.shopId === item.shop.shopId)?.total || 0;

				return {
					...item,
					weeks: [...item.weeks, total],
				};
			});
		}
		return salesReport;
	}

	IsLeapYear(year: number): boolean {
		return year % 400 === 0 ? true : year % 100 === 0 ? false : year % 4 === 0;
	}

	/**
	 * @obtiene el primer dia del año ISO
	 * @param year año a evaluar
	 * @returns fecha moment con la fecha del primer dia del año
	 */
	getFirstDayYear(year: number): moment.Moment {
		const date = moment(`${year}-01-01`);

		const weekYear = date.isoWeek();
		if (weekYear === 52) {
			const dateWeek = date.add(7, 'd');
			return dateWeek.subtract(dateWeek.day() - 1, 'd');
		}
		return date.subtract(date.day() - 1, 'd');
	}
}
