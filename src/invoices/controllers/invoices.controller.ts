import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Facturas')
@Controller('invoices')
export class InvoicesController {}
