import { Field, InputType } from '@nestjs/graphql';
import { VerifiedClose } from '../entities/close-z-invoicing.entity';

@InputType({ description: 'Datos para verificar los cierres z' })
export class VerifiedCloseZInput {
	@Field(() => String, {
		description: 'Identificador del cierre que se va a verificar',
	})
	closeZId: string;

    @Field(() => VerifiedClose, {
		description: 'Estado de verificado del cierre',
	})
	verifiedStatus: VerifiedClose;
}
