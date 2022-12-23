import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export enum Permissions {
	ACCESS_ERP = 'ACCESS_ERP',
	ACCESS_POS = 'ACCESS_POS',

	//PERMISOS DE INVENTARIOS
	INVENTORY_TRANSFERS_VERIFIED = 'INVENTORY_TRANSFERS_VERIFIED',
	ACCESS_INVENTORY_ADJUSTMENTS = 'ACCESS_INVENTORY_ADJUSTMENTS',
	ACCESS_INVENTORY_INPUTS = 'ACCESS_INVENTORY_INPUTS',
	ACCESS_INVENTORY_OUTPUTS = 'ACCESS_INVENTORY_OUTPUTS',
	ACCESS_INVENTORY_REQUESTS = 'ACCESS_INVENTORY_REQUESTS',
	ACCESS_INVENTORY_TRANSFERS = 'ACCESS_INVENTORY_TRANSFERS',
	READ_INVENTORY_ADJUSTMENTS = 'READ_INVENTORY_ADJUSTMENTS',
	READ_INVENTORY_INPUTS = 'READ_INVENTORY_INPUTS',
	READ_INVENTORY_OUTPUTS = 'READ_INVENTORY_OUTPUTS',
	READ_INVENTORY_REQUESTS = 'READ_INVENTORY_REQUESTS',
	READ_INVENTORY_TRANSFERS = 'READ_INVENTORY_TRANSFERS',
	CREATE_INVENTORY_ADJUSTMENT = 'CREATE_INVENTORY_ADJUSTMENT',
	CREATE_INVENTORY_INPUT = 'CREATE_INVENTORY_INPUT',
	CREATE_INVENTORY_OUTPUT = 'CREATE_INVENTORY_OUTPUT',
	CREATE_INVENTORY_REQUEST = 'CREATE_INVENTORY_REQUEST',
	CREATE_INVENTORY_TRANSFER = 'CREATE_INVENTORY_TRANSFER',
	UPDATE_INVENTORY_ADJUSTMENT = 'UPDATE_INVENTORY_ADJUSTMENT',
	UPDATE_INVENTORY_INPUT = 'UPDATE_INVENTORY_INPUT',
	UPDATE_INVENTORY_OUTPUT = 'UPDATE_INVENTORY_OUTPUT',
	UPDATE_INVENTORY_REQUEST = 'UPDATE_INVENTORY_REQUEST',
	UPDATE_INVENTORY_TRANSFER = 'UPDATE_INVENTORY_TRANSFER',
	PRINT_INVENTORY_ADJUSTMENT = 'PRINT_INVENTORY_ADJUSTMENT',
	PRINT_INVENTORY_INPUT = 'PRINT_INVENTORY_INPUT',
	PRINT_INVENTORY_OUTPUT = 'PRINT_INVENTORY_OUTPUT',
	PRINT_INVENTORY_REQUEST = 'PRINT_INVENTORY_REQUEST',
	PRINT_INVENTORY_TRANSFER = 'PRINT_INVENTORY_TRANSFER',
	AUTOGENERATE_INVENTORY_REQUEST = 'AUTOGENERATE_INVENTORY_REQUEST',
	CONFIRM_INVENTORY_TRANSFER = 'CONFIRM_INVENTORY_TRANSFER',

	//PERMISOS DE PRODUCTOS
	ACCESS_INVENTORY_ATTRIBS = 'ACCESS_INVENTORY_ATTRIBS',
	ACCESS_INVENTORY_BRANDS = 'ACCESS_INVENTORY_BRANDS',
	ACCESS_INVENTORY_CATEGORIES = 'ACCESS_INVENTORY_CATEGORIES',
	ACCESS_INVENTORY_COLORS = 'ACCESS_INVENTORY_COLORS',
	ACCESS_INVENTORY_PRODUCTS = 'ACCESS_INVENTORY_PRODUCTS',
	ACCESS_INVENTORY_REFERENCES = 'ACCESS_INVENTORY_REFERENCES',
	ACCESS_INVENTORY_SIZES = 'ACCESS_INVENTORY_SIZES',
	READ_INVENTORY_ATTRIBS = 'READ_INVENTORY_ATTRIBS',
	READ_INVENTORY_BRANDS = 'READ_INVENTORY_BRANDS',
	READ_INVENTORY_CATEGORIES = 'READ_INVENTORY_CATEGORIES',
	READ_INVENTORY_COLORS = 'READ_INVENTORY_COLORS',
	READ_INVENTORY_PRODUCTS = 'READ_INVENTORY_PRODUCTS',
	READ_INVENTORY_REFERENCES = 'READ_INVENTORY_REFERENCES',
	READ_INVENTORY_SIZES = 'READ_INVENTORY_SIZES',
	CREATE_INVENTORY_ATTRIB = 'CREATE_INVENTORY_ATTRIB',
	CREATE_INVENTORY_BRAND = 'CREATE_INVENTORY_BRAND',
	CREATE_INVENTORY_CATEGORY = 'CREATE_INVENTORY_CATEGORY',
	CREATE_INVENTORY_COLOR = 'CREATE_INVENTORY_COLOR',
	CREATE_INVENTORY_PRODUCT = 'CREATE_INVENTORY_PRODUCT',
	CREATE_INVENTORY_REFERENCE = 'CREATE_INVENTORY_REFERENCE',
	CREATE_INVENTORY_SIZE = 'CREATE_INVENTORY_SIZE',
	UPDATE_INVENTORY_ATTRIB = 'UPDATE_INVENTORY_ATTRIB',
	UPDATE_INVENTORY_BRAND = 'UPDATE_INVENTORY_BRAND',
	UPDATE_INVENTORY_CATEGORY = 'UPDATE_INVENTORY_CATEGORY',
	UPDATE_INVENTORY_COLOR = 'UPDATE_INVENTORY_COLOR',
	UPDATE_INVENTORY_PRODUCT = 'UPDATE_INVENTORY_PRODUCT',
	UPDATE_INVENTORY_REFERENCE = 'UPDATE_INVENTORY_REFERENCE',
	UPDATE_INVENTORY_SIZE = 'UPDATE_INVENTORY_SIZE',

	//PERMISOS DE VENTAS
	ACCESS_INVOICING_AUTHORIZATIONS = 'ACCESS_INVOICING_AUTHORIZATIONS',
	ACCESS_INVOICING_CLOSESX = 'ACCESS_INVOICING_CLOSESX',
	ACCESS_INVOICING_CLOSESZ = 'ACCESS_INVOICING_CLOSESZ',
	ACCESS_INVOICING_POINTOFSALES = 'ACCESS_INVOICING_POINTOFSALES',
	ACCESS_INVOICING_RETURNS = 'ACCESS_INVOICING_RETURNS',
	READ_INVOICING_AUTHORIZATIONS = 'READ_INVOICING_AUTHORIZATIONS',
	READ_INVOICING_CLOSESX = 'READ_INVOICING_CLOSESX',
	READ_INVOICING_CLOSESZ = 'READ_INVOICING_CLOSESZ',
	READ_INVOICING_INVOICES = 'READ_INVOICING_INVOICES',
	READ_INVOICING_ORDERS = 'READ_INVOICING_ORDERS',
	READ_INVOICING_POINTOFSALES = 'READ_INVOICING_POINTOFSALES',
	READ_INVOICING_RETURNS = 'READ_INVOICING_RETURNS',
	READ_INVOICING_DAILY_CLOSING = 'READ_INVOICING_DAILY_CLOSING',
	CREATE_INVOICING_AUTHORIZATION = 'CREATE_INVOICING_AUTHORIZATION',
	CREATE_INVOICING_CLOSEX = 'CREATE_INVOICING_CLOSEX',
	CREATE_INVOICING_CLOSEZ = 'CREATE_INVOICING_CLOSEZ',
	CREATE_INVOICING_POINTOFSALE = 'CREATE_INVOICING_POINTOFSALE',
	CREATE_INVOICING_ORDER = 'CREATE_INVOICING_ORDER',
	CREATE_INVOICING_RETURN = 'CREATE_INVOICING_RETURN',
	GENERATE_INVOICING_DAILY_CLOSING = 'GENERATE_INVOICING_DAILY_CLOSING',
	UPDATE_INVOICING_AUTHORIZATION = 'UPDATE_INVOICING_AUTHORIZATION',
	UPDATE_INVOICING_POINTOFSALE = 'UPDATE_INVOICING_POINTOFSALE',
	UPDATE_INVOICING_ORDER = 'UPDATE_INVOICING_ORDER',
	PRINT_INVOICING_CLOSEX = 'PRINT_INVOICING_CLOSEX',
	PRINT_INVOICING_CLOSEZ = 'PRINT_INVOICING_CLOSEZ',
	PRINT_INVOICING_ORDER = 'PRINT_INVOICING_ORDER',
	PRINT_INVOICING_RETURN = 'PRINT_INVOICING_RETURN',
	REPORT_INVOICING_GOAL_STATUS = 'REPORT_INVOICING_GOAL_STATUS',
	REPORT_INVOICING_SALES = 'REPORT_INVOICING_SALES',

	//PERMISOS DE CONFIGURACION
	ACCESS_CONFIGURATION_CONVEYORS = 'ACCESS_CONFIGURATION_CONVEYORS',
	ACCESS_CONFIGURATION_ROLES = 'ACCESS_CONFIGURATION_ROLES',
	ACCESS_CONFIGURATION_SHOPS = 'ACCESS_CONFIGURATION_SHOPS',
	ACCESS_CONFIGURATION_USERS = 'ACCESS_CONFIGURATION_USERS',
	ACCESS_CONFIGURATION_WAREHOUSES = 'ACCESS_CONFIGURATION_WAREHOUSES',
	READ_CONFIGURATION_IMAGES = 'READ_CONFIGURATION_IMAGES',
	READ_CONFIGURATION_CONVEYORS = 'READ_CONFIGURATION_CONVEYORS',
	READ_CONFIGURATION_PERMISSIONS = 'READ_CONFIGURATION_PERMISSIONS',
	READ_CONFIGURATION_ROLES = 'READ_CONFIGURATION_ROLES',
	READ_CONFIGURATION_SHOPS = 'READ_CONFIGURATION_SHOPS',
	READ_CONFIGURATION_USERS = 'READ_CONFIGURATION_USERS',
	READ_CONFIGURATION_WAREHOUSES = 'READ_CONFIGURATION_WAREHOUSES',
	CREATE_CONFIGURATION_ROLE = 'CREATE_CONFIGURATION_ROLE',
	CREATE_CONFIGURATION_SHOP = 'CREATE_CONFIGURATION_SHOP',
	CREATE_CONFIGURATION_USER = 'CREATE_CONFIGURATION_USER',
	CREATE_CONFIGURATION_WAREHOUSE = 'CREATE_CONFIGURATION_WAREHOUSE',
	UPDATE_CONFIGURATION_ROLE = 'UPDATE_CONFIGURATION_ROLE',
	UPDATE_CONFIGURATION_SHOP = 'UPDATE_CONFIGURATION_SHOP',
	UPDATE_CONFIGURATION_USER = 'UPDATE_CONFIGURATION_USER',
	UPDATE_CONFIGURATION_WAREHOUSE = 'UPDATE_CONFIGURATION_WAREHOUSE',

	//PERMISOS DE CRM
	ACCESS_CRM_CITIES = 'ACCESS_CRM_CITIES',
	ACCESS_CRM_COUPONS = 'ACCESS_CRM_COUPONS',
	ACCESS_CRM_CUSTOMERS = 'ACCESS_CRM_CUSTOMERS',
	ACCESS_CRM_DISCOUNTRULES = 'ACCESS_CRM_DISCOUNTRULES',
	READ_CRM_CITIES = 'READ_CRM_CITIES',
	READ_CRM_COUPONS = 'READ_CRM_COUPONS',
	READ_CRM_CUSTOMERS = 'READ_CRM_CUSTOMERS',
	READ_CRM_CUSTOMERTYPES = 'READ_CRM_CUSTOMERTYPES',
	READ_CRM_DISCOUNTRULES = 'READ_CRM_DISCOUNTRULES',
	CREATE_CRM_CITY = 'CREATE_CRM_CITY',
	CREATE_CRM_COUPON = 'CREATE_CRM_COUPON',
	CREATE_CRM_CUSTOMER = 'CREATE_CRM_CUSTOMER',
	CREATE_CRM_DISCOUNTRULE = 'CREATE_CRM_DISCOUNTRULE',
	UPDATE_CRM_CITY = 'UPDATE_CRM_CITY',
	UPDATE_CRM_COUPON = 'UPDATE_CRM_COUPON',
	UPDATE_CRM_CUSTOMER = 'UPDATE_CRM_CUSTOMER',
	UPDATE_CRM_DISCOUNTRULE = 'UPDATE_CRM_DISCOUNTRULE',
	PRINT_CRM_COUPON = 'PRINT_CRM_COUPON',

	//PERMISOS DE TESORERIA
	ACCESS_TREASURY_BOXES = 'ACCESS_TREASURY_BOXES',
	ACCESS_TREASURY_EXPENSES = 'ACCESS_TREASURY_EXPENSES',
	ACCESS_TREASURY_PAYMENTS = 'ACCESS_TREASURY_PAYMENTS',
	ACCESS_TREASURY_RECEIPT = 'ACCESS_TREASURY_RECEIPT',
	READ_TREASURY_BOXES = 'READ_TREASURY_BOXES',
	READ_TREASURY_EXPENSES = 'READ_TREASURY_EXPENSES',
	READ_TREASURY_PAYMENTS = 'READ_TREASURY_PAYMENTS',
	READ_TREASURY_RECEIPTS = 'READ_TREASURY_RECEIPTS',
	READ_TREASURY_ERRORS_CASH = 'READ_TREASURY_ERRORS_CASH',
	CREATE_TREASURY_BOX = 'CREATE_TREASURY_BOX',
	CREATE_TREASURY_EXPENSE = 'CREATE_TREASURY_EXPENSE',
	CREATE_TREASURY_PAYMENT = 'CREATE_TREASURY_PAYMENT',
	CREATE_TREASURY_RECEIPT = 'CREATE_TREASURY_RECEIPT',
	UPDATE_TREASURY_BOX = 'UPDATE_TREASURY_BOX',
	UPDATE_TREASURY_EXPENSE = 'UPDATE_TREASURY_EXPENSE',
	UPDATE_TREASURY_PAYMENT = 'UPDATE_TREASURY_PAYMENT',
	UPDATE_TREASURY_RECEIPT = 'UPDATE_TREASURY_RECEIPT',
	PRINT_TREASURY_EXPENSE = 'PRINT_TREASURY_EXPENSE',
	PRINT_TREASURY_RECEIPT = 'PRINT_TREASURY_RECEIPT',
	VERIFIED_TREASURY_ERRRORS_CASH = 'VERIFIED_TREASURY_ERRRORS_CASH',

	//PERMISOS DE CREDITOS
	ACCESS_CREDITS = 'ACCESS_CREDITS',
	READ_CREDITS = 'READ_CREDITS',
	CREATE_CREDIT = 'CREATE_CREDIT',
	UPDATE_CREDIT = 'UPDATE_CREDIT',
}

registerEnumType(Permissions, { name: 'Permissions' });

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: [Permissions]) =>
	applyDecorators(
		UseGuards(JwtAuthGuard, PermissionsGuard),
		SetMetadata(PERMISSIONS_KEY, permissions),
	);
