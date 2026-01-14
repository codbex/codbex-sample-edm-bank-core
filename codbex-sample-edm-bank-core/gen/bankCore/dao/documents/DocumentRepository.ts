import { sql, query } from "@aerokit/sdk/db";
import { producer } from "@aerokit/sdk/messaging";
import { extensions } from "@aerokit/sdk/extensions";
import { dao as daoApi } from "@aerokit/sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface DocumentEntity {
    readonly id: number;
    customerId: number;
    documentType: string;
    fileName: string;
    content: unknown;
    checksum?: string;
    uploadedAt?: Date;
}

export interface DocumentCreateEntity {
    readonly customerId: number;
    readonly documentType: string;
    readonly fileName: string;
    readonly content: unknown;
    readonly checksum?: string;
}

export interface DocumentUpdateEntity extends DocumentCreateEntity {
    readonly id: number;
}

export interface DocumentEntityOptions {
    $filter?: {
        equals?: {
            id?: number | number[];
            customerId?: number | number[];
            documentType?: string | string[];
            fileName?: string | string[];
            content?: unknown | unknown[];
            checksum?: string | string[];
            uploadedAt?: Date | Date[];
        };
        notEquals?: {
            id?: number | number[];
            customerId?: number | number[];
            documentType?: string | string[];
            fileName?: string | string[];
            content?: unknown | unknown[];
            checksum?: string | string[];
            uploadedAt?: Date | Date[];
        };
        contains?: {
            id?: number;
            customerId?: number;
            documentType?: string;
            fileName?: string;
            content?: unknown;
            checksum?: string;
            uploadedAt?: Date;
        };
        greaterThan?: {
            id?: number;
            customerId?: number;
            documentType?: string;
            fileName?: string;
            content?: unknown;
            checksum?: string;
            uploadedAt?: Date;
        };
        greaterThanOrEqual?: {
            id?: number;
            customerId?: number;
            documentType?: string;
            fileName?: string;
            content?: unknown;
            checksum?: string;
            uploadedAt?: Date;
        };
        lessThan?: {
            id?: number;
            customerId?: number;
            documentType?: string;
            fileName?: string;
            content?: unknown;
            checksum?: string;
            uploadedAt?: Date;
        };
        lessThanOrEqual?: {
            id?: number;
            customerId?: number;
            documentType?: string;
            fileName?: string;
            content?: unknown;
            checksum?: string;
            uploadedAt?: Date;
        };
    },
    $select?: (keyof DocumentEntity)[],
    $sort?: string | (keyof DocumentEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface DocumentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DocumentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface DocumentUpdateEntityEvent extends DocumentEntityEvent {
    readonly previousEntity: DocumentEntity;
}

export class DocumentRepository {

    private static readonly DEFINITION = {
        table: "SAMPLE_BANK_DOCUMENT",
        properties: [
            {
                name: "id",
                column: "DOCUMENT_ID",
                type: "BIGINT",
                id: true,
                autoIncrement: true,
            },
            {
                name: "customerId",
                column: "DOCUMENT_CUSTOMERID",
                type: "BIGINT",
                required: true
            },
            {
                name: "documentType",
                column: "DOCUMENT_DOCUMENTTYPE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "fileName",
                column: "DOCUMENT_FILENAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "content",
                column: "DOCUMENT_CONTENT",
                type: "BLOB",
                required: true
            },
            {
                name: "checksum",
                column: "DOCUMENT_CHECKSUM",
                type: "VARCHAR",
            },
            {
                name: "uploadedAt",
                column: "DOCUMENT_UPLOADEDAT",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DocumentRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: DocumentEntityOptions = {}): DocumentEntity[] {
        let list = this.dao.list(options).map((e: DocumentEntity) => {
            EntityUtils.setDate(e, "uploadedAt");
            return e;
        });
        return list;
    }

    public findById(id: number, options: DocumentEntityOptions = {}): DocumentEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "uploadedAt");
        return entity ?? undefined;
    }

    public create(entity: DocumentCreateEntity): number {
        EntityUtils.setLocalDate(entity, "uploadedAt");
        // @ts-ignore
        (entity as DocumentEntity).uploadedAt = new Date();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SAMPLE_BANK_DOCUMENT",
            entity: entity,
            key: {
                name: "id",
                column: "DOCUMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DocumentUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "uploadedAt");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SAMPLE_BANK_DOCUMENT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "id",
                column: "DOCUMENT_ID",
                value: entity.id
            }
        });
    }

    public upsert(entity: DocumentCreateEntity | DocumentUpdateEntity): number {
        const id = (entity as DocumentUpdateEntity).id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DocumentUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "SAMPLE_BANK_DOCUMENT",
            entity: entity,
            key: {
                name: "id",
                column: "DOCUMENT_ID",
                value: id
            }
        });
    }

    public count(options?: DocumentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SAMPLE_BANK_DOCUMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DocumentEntityEvent | DocumentUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-sample-edm-bank-core-documents-Document", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-sample-edm-bank-core-documents-Document").send(JSON.stringify(data));
    }
}
