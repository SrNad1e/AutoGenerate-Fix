import { Field, ObjectType } from "@nestjs/graphql";
import { Warehouse } from "src/configurations/entities/warehouse.entity";
import { Color } from "src/products/entities/color.entity";
import { Reference } from "src/products/entities/reference.entity";
import { Size } from "src/products/entities/size.entity";

@ObjectType({ description: 'Inventarios' })
class InventoryReport {
    @Field(() => Warehouse, { description: 'Bodega' })
    warehouse: Warehouse;

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

    @Field(() => Number, { description: 'Cantidad en bodega' })
    stockQuantity: number;
}

@ObjectType({ description: 'Respuesta al listado de los productos' })
export class ResponseStock{
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