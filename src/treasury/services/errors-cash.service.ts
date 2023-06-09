import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { CloseZInvoicing } from 'src/sales/entities/close-z-invoicing.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { CreateErrorCashInput } from '../dtos/create-errorCash.input';
import { FiltersErrorsCashInput } from '../dtos/filters-errorsCash.input';
import { VerifiedErrorsCashInput } from '../dtos/verified-errors-cash.input';
import { Box } from '../entities/box.entity';
import { ErrorCash, TypeErrorCash } from '../entities/error-cash.entity';
import { BoxService } from './box.service';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

const populate = [
	{
		path: 'boxOrigin',
		model: Box.name,
	},
	{
		path: 'boxDestination',
		model: Box.name,
	},
	{
		path: 'closeZ',
		model: CloseZInvoicing.name,
	},
	{
		path: 'closeZ',
		populate: {
			path: 'pointOfSale',
			model: PointOfSale.name,
		},
	},
];

@Injectable()
export class ErrorsCashService {
	constructor(
		@InjectModel(ErrorCash.name)
		private readonly errorCashModel: PaginateModel<ErrorCash>,
		@InjectModel(CloseZInvoicing.name)
		private readonly closeZInvoicingModel: PaginateModel<CloseZInvoicing>,
		private readonly boxesService: BoxService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async findAll(
		{
			closeZNumber,
			limit = 10,
			page = 1,
			sort,
			typeError,
			value,
			verified,
			boxId
		}: FiltersErrorsCashInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<ErrorCash> = {};
		const newTypeError = TypeErrorCash[typeError] || typeError;

		if (user.username !== this.configService.USER_ADMIN) {
			filters.company = new Types.ObjectId(companyId);
		}

		if (verified !== undefined) {
			filters.verified = verified;
		}

		if (value) {
			filters.value = value;
		}

		if (newTypeError) {
			filters.typeError = newTypeError;
		}

		if (boxId) {
			filters.boxOrigin = new Types.ObjectId(boxId);
		}

		if (closeZNumber) {
			const closeZ = await this.closeZInvoicingModel.find({
				number: closeZNumber,
				company: new Types.ObjectId(companyId),
			});

			if (closeZ) {
				filters.closeZ = {
					$in: closeZ.map((c) => c._id),
				};
			}
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.errorCashModel.paginate(filters, options);
	}

	async verified({ errorCashId, reason }: VerifiedErrorsCashInput, user: User) {
		const errorCash = await this.errorCashModel.findById(errorCashId);

		if (!errorCash) {
			throw new BadRequestException('El erro que intentas verificar no existe');
		}

		const box = await this.boxesService.findById(
			errorCash.boxDestination.toString(),
		);

		const total = box.total + errorCash.value;

		await this.boxesService.updateTotal(box._id.toString(), total);

		return this.errorCashModel.findByIdAndUpdate(
			errorCashId,
			{
				$set: {
					reason,
					verified: true,
					user: {
						username: user.username,
						_id: user._id,
						name: user.name,
					},
				},
			},
			{
				new: true,
				populate,
				lean: true,
			},
		);
	}

	async addRegister(
		{ closeZId, value, typeError }: CreateErrorCashInput,
		user: User,
		companyId: string,
	) {
		const newTypeError = TypeErrorCash[typeError] || typeError;

		const closeZ = await this.closeZInvoicingModel
			.findById(closeZId)
			.populate([
				{
					path: 'pointOfSale',
					model: PointOfSale.name,
				},
			])
			.lean();

		const boxMain = await this.boxesService.findOne(
			{
				isMain: true,
			},
			companyId,
		);

		if (!closeZ) {
			throw new BadRequestException('El cierre no existe');
		}

		if (value <= 0) {
			throw new BadRequestException(
				'El valor del error no puede ser menor o igual que 0',
			);
		}

		return this.errorCashModel.create({
			boxOrigin: closeZ.pointOfSale['box'],
			boxDestination: boxMain._id,
			closeZ: closeZ._id,
			typeError: newTypeError,
			value,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			company: new Types.ObjectId(companyId),
		});
	}
}
