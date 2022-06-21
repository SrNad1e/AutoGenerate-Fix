import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateReceiptInput } from '../dtos/create-receipt.input';
import { FiltersReceiptsInput } from '../dtos/filters-receipts.input';
import { ResponseReceipt } from '../dtos/response-receipt';
import { ResponseReceipts } from '../dtos/response-receipts.input';
import { UpdateReceiptInput } from '../dtos/update-receipt.input';
import { Receipt } from '../entities/receipt.entity';
import { ReceiptsService } from '../services/receipts.service';

@Resolver()
export class ReceiptsResolver {
	constructor(private readonly receiptsServices: ReceiptsService) {}

	@Query(() => ResponseReceipts, {
		name: 'receipts',
		description: 'Se encarga de listar los metodos de pago',
	})
	@RequirePermissions(Permissions.READ_TREASURY_RECEIPTS)
	findAll(
		@Args({
			name: 'filtersReceiptsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar los recibos de caja',
		})
		_: FiltersReceiptsInput,
		@Context() context,
	) {
		return this.receiptsServices.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ResponseReceipt, {
		name: 'createReceipt',
		description: 'Crea una recibo de caja',
	})
	@RequirePermissions(Permissions.CREATE_TREASURY_RECEIPT)
	create(
		@Args('createReceiptInput', {
			description: 'Datos para la creación del recibo de caja',
		})
		_: CreateReceiptInput,
		@Context() context,
	) {
		return this.receiptsServices.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Receipt, {
		name: 'updateReceipt',
		description: 'Actualiza un recibo de caja',
	})
	@RequirePermissions(Permissions.UPDATE_TREASURY_RECEIPT)
	update(
		@Args('id', {
			description: 'Identificador del recibo de caja para actualizar',
		})
		id: string,
		@Args('updateReceiptInput', {
			description: 'Datos para actualizar el recibo de caja',
		})
		_: UpdateReceiptInput,
		@Context() context,
	) {
		return this.receiptsServices.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
