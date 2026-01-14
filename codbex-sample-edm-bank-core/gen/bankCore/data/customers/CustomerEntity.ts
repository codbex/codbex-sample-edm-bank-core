import { Entity, Table, Id, Generated, Column, Documentation } from '@aerokit/sdk/db'

@Entity('CustomerEntity')
@Table('SAMPLE_BANK_CUSTOMER')
@Documentation('Customer entity mapping')
export class CustomerEntity {

    @Id()
    @Generated('sequence')
    @Documentation('id')
    @Column({
        name: 'CUSTOMER_ID',
        type: 'long',
    })
    public id?: number;

    @Documentation('customerNumber')
    @Column({
        name: 'CUSTOMER_CUSTOMERNUMBER',
        type: 'string',
        length: 20,
    })
    public customerNumber!: string;

    @Documentation('type')
    @Column({
        name: 'CUSTOMER_TYPE',
        type: 'string',
        length: 1,
        defaultValue: `'I'`,
        nullable: true,
    })
    public type?: string;

    @Documentation('firstName')
    @Column({
        name: 'CUSTOMER_FIRSTNAME',
        type: 'string',
        length: 100,
    })
    public firstName!: string;

    @Documentation('lastName')
    @Column({
        name: 'CUSTOMER_LASTNAME',
        type: 'string',
        length: 100,
    })
    public lastName!: string;

    @Documentation('dateOfBirth')
    @Column({
        name: 'CUSTOMER_DATEOFBIRTH',
        type: 'date',
        nullable: true,
    })
    public dateOfBirth?: Date;

    @Documentation('isActive')
    @Column({
        name: 'CUSTOMER_ISACTIVE',
        type: 'boolean',
        defaultValue: `true`,
        nullable: true,
    })
    public isActive?: boolean;

    @Documentation('riskScore')
    @Column({
        name: 'CUSTOMER_RISKSCORE',
        type: 'float',
        defaultValue: `0`,
        nullable: true,
    })
    public riskScore?: number;

    @Documentation('profileNotes')
    @Column({
        name: 'CUSTOMER_PROFILENOTES',
        type: 'clob',
        nullable: true,
    })
    public profileNotes?: unknown;

    @Documentation('createdAt')
    @Column({
        name: 'CUSTOMER_CREATEDAT',
        type: 'timestamp',
        nullable: true,
    })
    public createdAt?: Date;

    @Documentation('updatedAt')
    @Column({
        name: 'CUSTOMER_UPDATEDAT',
        type: 'timestamp',
        nullable: true,
    })
    public updatedAt?: Date;

}

(new CustomerEntity());
