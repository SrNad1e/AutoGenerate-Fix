import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/configurations/entities/user.entity";
import { Warehouse } from "src/configurations/entities/warehouse.entity";
import { Color } from "src/products/entities/color.entity";
import { Reference } from "src/products/entities/reference.entity";
import { Size } from "src/products/entities/size.entity";


@ObjectType({ description: 'Inventario por bodegas del producto' })
class StockProduct {
	@Field(() => Warehouse, { description: 'Identificador de la bodega', nullable: true })
	warehouse: Warehouse;

	@Field(() => Number, { description: 'Cantidad de productos en la bodega' })
	quantity: number;

	@Field(() => User, { description: 'Usuario que crea los datos de envío' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación del dato de envio' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del dato de envio',
	})
	updatedAt: Date;
}

@ObjectType({ description: 'Inventarios' })
class InventoryReport {
	@Field(() => StockProduct, { description: 'Bodega', nullable: true })
	stock: StockProduct;

	@Field(() => String, { description: 'Codigo de barras' })
	barcode: string;

	@Field(() => Reference, {
		description: 'Referencia del producto',
	})
	reference: Reference;

	@Field(() => Color, { description: 'Color del producto' })
	color: Color;

	@Field(() => Size, { description: 'Talla del producto' })
	size: Size;

	@Field(() => Warehouse, { description: 'bodega del producto', nullable: true })
	productWarehouse: Warehouse
}

@ObjectType({ description: 'Respuesta al listado de los productos' })
export class ResponseStock {
	@Field(() => [InventoryReport], { description: 'Lista de productos con inventario' })
	docs: InventoryReport[];

	@Field(() => Number, { description: 'Total de documentos' })
	totalDocs: number;

	@Field(() => Number, { description: 'Total de docuementos solicitados' })
	limit: number;

	@Field(() => Number, { description: 'Total de páginas' })
	totalPages: number;

	@Field(() => Number, { description: 'Página actual' })
	page: number;

	@Field(() => Number, { description: '' })
	pagingCounter: number;

	@Field(() => Boolean, { description: '¿Encuentra página anterior?' })
	hasPrevPage: boolean;

	@Field(() => Boolean, { description: '¿Encuentra página siguiente?' })
	hasNextPage: boolean;

	@Field(() => Number || null, { description: 'Página anterior' })
	prevPage: number | null;

	@Field(() => Number || null, { description: 'Página siguente' })
	nextPage: number | null;
}