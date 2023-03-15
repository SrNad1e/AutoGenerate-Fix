import {
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types, PopulateOptions } from 'mongoose';

import { Expense } from 'src/treasury/entities/expense.entity';
import { CreateCloseVerifiedInput } from '../dtos/create-close-verified-input';
import { CloseVerified } from '../entities/close-verified-invoicing.entity';
import { CloseZInvoicing } from '../entities/close-z-invoicing.entity';

const populate: PopulateOptions[] = [
    {
        path: 'pointOfSale',
        populate: [
            {
                path: 'authorization',
                model: 'AuthorizationDian',
            },
            {
                path: 'shop',
                model: 'Shop',
            },
        ],
    },
    {
        path: 'payments',
        populate: {
            path: 'payment',
            model: 'Payment',
        },
    },
    {
        path: 'paymentsCredit',
        populate: {
            path: 'payment',
            model: 'Payment',
        },
    },
    {
        path: 'expenses',
        model: Expense.name,
    },
];

@Injectable()
export class CloseVerifiedService {
    constructor(
        @InjectModel(CloseVerified.name)
        private readonly closeVerifiedModel: PaginateModel<CloseVerified>,
        @InjectModel(CloseZInvoicing.name)
        private readonly closeZInvoicingModel: PaginateModel<CloseZInvoicing>,
    ) { }

    async findById(id: string) {
        return this.closeVerifiedModel.findOne({ closeZ: new Types.ObjectId(id) }).populate(populate);
    }

    async create(
        { bankReport, cashRegister, cashReport, closeZId, dataphoneReport, expenses, observation }: CreateCloseVerifiedInput,
    ) {
        const closeZVerified = await this.closeZInvoicingModel.findById(closeZId).populate(populate)
        if (!closeZVerified) {
            throw new Error("El cierre z no existe");
        }
        return this.closeVerifiedModel.create({
            newQuantityBank: bankReport,
            newQuantityDataphone: dataphoneReport,
            newExpense: expenses,
            newTotalPaymentRegister: cashRegister,
            newTotalPaymentReport: cashReport,
            observation,
            closeZ: new Types.ObjectId(closeZId),
            company: closeZVerified.company,
            pointOfSale: closeZVerified.pointOfSale,
            closeDate: closeZVerified.closeDate,
            user: closeZVerified.user,
            payments: closeZVerified.payments,
            summaryOrder: closeZVerified.summaryOrder,
            expenses: closeZVerified.expenses,
            number: closeZVerified.number,
            cashRegister: closeZVerified.cashRegister,
            refunds: closeZVerified.refunds,
            paymentsCredit: closeZVerified.paymentsCredit,
            prefix: closeZVerified.prefix,
            quantityBank: closeZVerified.quantityBank,
            quantityDataphone: closeZVerified.quantityDataphone
        })
    }

}
