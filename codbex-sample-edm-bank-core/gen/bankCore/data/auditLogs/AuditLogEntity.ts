import { Entity, Table, Id, Generated, Column, Documentation } from '@aerokit/sdk/db'

@Entity('AuditLogEntity')
@Table('SAMPLE_BANK_AUDITLOG')
@Documentation('AuditLog entity mapping')
export class AuditLogEntity {

    @Id()
    @Generated('sequence')
    @Documentation('id')
    @Column({
        name: 'AUDITLOG_ID',
        type: 'long',
    })
    public id?: number;

    @Documentation('entityName')
    @Column({
        name: 'AUDITLOG_ENTITYNAME',
        type: 'string',
        length: 100,
    })
    public entityName!: string;

    @Documentation('entityId')
    @Column({
        name: 'AUDITLOG_ENTITYID',
        type: 'long',
        nullable: true,
    })
    public entityId?: number;

    @Documentation('operation')
    @Column({
        name: 'AUDITLOG_OPERATION',
        type: 'string',
        length: 1,
    })
    public operation!: string;

    @Documentation('oldValue')
    @Column({
        name: 'AUDITLOG_OLDVALUE',
        type: 'clob',
        nullable: true,
    })
    public oldValue?: unknown;

    @Documentation('newValue')
    @Column({
        name: 'AUDITLOG_NEWVALUE',
        type: 'clob',
        nullable: true,
    })
    public newValue?: unknown;

    @Documentation('createdAt')
    @Column({
        name: 'AUDITLOG_CREATEDAT',
        type: 'timestamp',
        nullable: true,
    })
    public createdAt?: Date;

}

(new AuditLogEntity());
