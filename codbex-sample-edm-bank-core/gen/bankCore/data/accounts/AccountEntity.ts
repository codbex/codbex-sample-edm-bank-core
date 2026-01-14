import { Entity, Table, Id, Generated, Column, Documentation } from '@aerokit/sdk/db'

@Entity('AccountEntity')
@Table('SAMPLE_BANK_ACCOUNT')
@Documentation('Account entity mapping')
export class AccountEntity {

    @Id()
    @Generated('sequence')
    @Documentation('id')
    @Column({
        name: 'ACCOUNT_ID',
        type: 'long',
    })
    public id?: number;

    @Documentation('iban')
    @Column({
        name: 'ACCOUNT_IBAN',
        type: 'string',
        length: 34,
        nullable: true,
    })
    public iban!: string;

    @Documentation('customerId')
    @Column({
        name: 'ACCOUNT_CUSTOMERID',
        type: 'long',
    })
    public customerId!: number;

    @Documentation('currency')
    @Column({
        name: 'ACCOUNT_CURRENCY',
        type: 'string',
        length: 3,
        defaultValue: `'EUR'`,
        nullable: true,
    })
    public currency?: string;

    @Documentation('balance')
    @Column({
        name: 'ACCOUNT_BALANCE',
        type: 'big_decimal',
        precision: 15,
        scale: 2,
        defaultValue: `0`,
        nullable: true,
    })
    public balance?: number;

    @Documentation('overdraftLimit')
    @Column({
        name: 'ACCOUNT_OVERDRAFTLIMIT',
        type: 'big_decimal',
        precision: 15,
        scale: 2,
        defaultValue: `0`,
        nullable: true,
    })
    public overdraftLimit?: number;

    @Documentation('status')
    @Column({
        name: 'ACCOUNT_STATUS',
        type: 'short',
        defaultValue: `1`,
        nullable: true,
    })
    public status?: number;

    @Documentation('openedOn')
    @Column({
        name: 'ACCOUNT_OPENEDON',
        type: 'date',
        defaultValue: `CURRENT_DATE`,
        nullable: true,
    })
    public openedOn?: Date;

    @Documentation('lastAccessTime')
    @Column({
        name: 'ACCOUNT_LASTACCESSTIME',
        type: 'time',
        nullable: true,
    })
    public lastAccessTime?: Date;

    @Documentation('createdAt')
    @Column({
        name: 'ACCOUNT_CREATEDAT',
        type: 'timestamp',
        nullable: true,
    })
    public createdAt?: Date;

    @Documentation('updatedAt')
    @Column({
        name: 'ACCOUNT_UPDATEDAT',
        type: 'time',
        nullable: true,
    })
    public updatedAt?: Date;

}

(new AccountEntity());
