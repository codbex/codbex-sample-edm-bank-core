import {
    Entity,
    Table,
    Id,
    Generated,
    Column,
    Documentation
} from '@aerokit/sdk/db';

@Entity('TransactionEntity')
@Table('SAMPLE_BANK_TRANSACTION')
@Documentation('TransactionEntity - Manage entity Transaction')
export class TransactionEntity {

    @Id()
    @Generated('sequence')
    @Documentation('id')
    @Column({
        name: 'TRANSACTION_ID',
        type: 'long',
    })
    public id?: number;

    @Documentation('accountId')
    @Column({
        name: 'TRANSACTION_ACCOUNTID',
        type: 'long',
    })
    public accountId!: number;

    @Documentation('reference')
    @Column({
        name: 'TRANSACTION_REFERENCE',
        type: 'string',
        length: 64,
    })
    public reference!: string;

    @Documentation('amount')
    @Column({
        name: 'TRANSACTION_AMOUNT',
        type: 'big_decimal',
        precision: 15,
        scale: 2,
    })
    public amount!: number;

    @Documentation('direction')
    @Column({
        name: 'TRANSACTION_DIRECTION',
        type: 'string',
        length: 1,
    })
    public direction!: string;

    @Documentation('fee')
    @Column({
        name: 'TRANSACTION_FEE',
        type: 'double',
        defaultValue: `0`,
        nullable: true,
    })
    public fee?: number;

    @Documentation('exchangeRate')
    @Column({
        name: 'TRANSACTION_EXCHANGERATE',
        type: 'float',
        nullable: true,
    })
    public exchangeRate?: number;

    @Documentation('approved')
    @Column({
        name: 'TRANSACTION_APPROVED',
        type: 'boolean',
        defaultValue: `false`,
        nullable: true,
    })
    public approved?: boolean;

    @Documentation('createdOn')
    @Column({
        name: 'TRANSACTION_CREATEDON',
        type: 'timestamp',
        nullable: true,
    })
    public createdOn?: Date;

}

(new TransactionEntity());
