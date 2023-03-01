import { InputType, Field } from "@nestjs/graphql";

@InputType({ description: 'Filtros para la lista de inventarios' })
export class FiltersStockInput {
	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field({ description: 'Estado del producto', nullable: true })
	status?: string;

	@Field({
		description:
			'Comodín para la busqueda del producto, barcode, reference, description',
		nullable: true,
	})
	name?: string;

	@Field({ description: 'Id de color', nullable: true })
	colorId?: string;

	@Field({ description: 'Id de talla', nullable: true })
	sizeId?: string;

	@Field(() => String, {
		description:
			'Bodega de inventario o "all" para traer todos los inventarios',
		nullable: true,
	})
	warehouseId?: string;
}