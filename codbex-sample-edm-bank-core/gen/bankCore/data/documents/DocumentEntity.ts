import { Entity, Table, Id, Generated, Column, Documentation } from '@aerokit/sdk/db'

@Entity('DocumentEntity')
@Table('SAMPLE_BANK_DOCUMENT')
@Documentation('Document entity mapping')
export class DocumentEntity {

    @Id()
    @Generated('sequence')
    @Documentation('id')
    @Column({
        name: 'DOCUMENT_ID',
        type: 'long',
    })
    public id?: number;

    @Documentation('customerId')
    @Column({
        name: 'DOCUMENT_CUSTOMERID',
        type: 'long',
    })
    public customerId!: number;

    @Documentation('documentType')
    @Column({
        name: 'DOCUMENT_DOCUMENTTYPE',
        type: 'string',
        length: 50,
    })
    public documentType!: string;

    @Documentation('fileName')
    @Column({
        name: 'DOCUMENT_FILENAME',
        type: 'string',
        length: 255,
    })
    public fileName!: string;

    @Documentation('content')
    @Column({
        name: 'DOCUMENT_CONTENT',
        type: 'blob',
    })
    public content!: unknown;

    @Documentation('checksum')
    @Column({
        name: 'DOCUMENT_CHECKSUM',
        type: 'string',
        length: 64,
        nullable: true,
    })
    public checksum?: string;

    @Documentation('uploadedAt')
    @Column({
        name: 'DOCUMENT_UPLOADEDAT',
        type: 'date',
        nullable: true,
    })
    public uploadedAt?: Date;

}

(new DocumentEntity());
