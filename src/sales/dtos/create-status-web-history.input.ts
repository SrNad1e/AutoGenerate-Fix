import { Field, InputType } from '@nestjs/graphql';
import { User } from 'src/configurations/entities/user.entity';
import { StatusWeb } from '../entities/status-web-history';

@InputType({ description: 'Datos para la creación de un registro' })
export class CreateStatusWebHistoryInput {
	@Field(() => String, { description: 'Identificador del pedido' })
	orderId: string;

	@Field(() => StatusWeb, { description: 'Estado del pedido' })
	status: StatusWeb;

	@Field(() => User, { description: 'Usuario que crea el registro' })
	user: User;
}
