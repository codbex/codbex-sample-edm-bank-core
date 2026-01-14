import { sql, query } from "@aerokit/sdk/db";
import { producer } from "@aerokit/sdk/messaging";
import { extensions } from "@aerokit/sdk/extensions";
import { dao as daoApi } from "@aerokit/sdk/db";

export interface AuditLogEntity {
    readonly id: number;
    entityName: string;
    entityId?: number;
    operation: string;
    oldValue?: unknown;
    newValue?: unknown;
    createdAt?: Date;
}

export interface AuditLogCreateEntity {
    readonly entityName: string;
    readonly entityId?: number;
    readonly operation: string;
    readonly oldValue?: unknown;
    readonly newValue?: unknown;
}

export interface AuditLogUpdateEntity extends AuditLogCreateEntity {
    readonly id: number;
}

export interface AuditLogEntityOptions {
    $filter?: {
        equals?: {
            id?: number | number[];
            entityName?: string | string[];
            entityId?: number | number[];
            operation?: string | string[];
            oldValue?: unknown | unknown[];
            newValue?: unknown | unknown[];
            createdAt?: Date | Date[];
        };
        notEquals?: {
            id?: number | number[];
            entityName?: string | string[];
            entityId?: number | number[];
            operation?: string | string[];
            oldValue?: unknown | unknown[];
            newValue?: unknown | unknown[];
            createdAt?: Date | Date[];
        };
        contains?: {
            id?: number;
            entityName?: string;
            entityId?: number;
            operation?: string;
            oldValue?: unknown;
            newValue?: unknown;
            createdAt?: Date;
        };
        greaterThan?: {
            id?: number;
            entityName?: string;
            entityId?: number;
            operation?: string;
            oldValue?: unknown;
            newValue?: unknown;
            createdAt?: Date;
        };
        greaterThanOrEqual?: {
            id?: number;
            entityName?: string;
            entityId?: number;
            operation?: string;
            oldValue?: unknown;
            newValue?: unknown;
            createdAt?: Date;
        };
        lessThan?: {
            id?: number;
            entityName?: string;
            entityId?: number;
            operation?: string;
            oldValue?: unknown;
            newValue?: unknown;
            createdAt?: Date;
        };
        lessThanOrEqual?: {
            id?: number;
            entityName?: string;
            entityId?: number;
            operation?: string;
            oldValue?: unknown;
            newValue?: unknown;
            createdAt?: Date;
        };
    },
    $select?: (keyof AuditLogEntity)[],
    $sort?: string | (keyof AuditLogEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface AuditLogEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AuditLogEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface AuditLogUpdateEntityEvent extends AuditLogEntityEvent {
    readonly previousEntity: AuditLogEntity;
}

export class AuditLogRepository {

    private static readonly DEFINITION = {
        table: "SAMPLE_BANK_AUDITLOG",
        properties: [
            {
                name: "id",
                column: "AUDITLOG_ID",
                type: "BIGINT",
                id: true,
                autoIncrement: true,
            },
            {
                name: "entityName",
                column: "AUDITLOG_ENTITYNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "entityId",
                column: "AUDITLOG_ENTITYID",
                type: "BIGINT",
            },
            {
                name: "operation",
                column: "AUDITLOG_OPERATION",
                type: "CHAR",
                required: true
            },
            {
                name: "oldValue",
                column: "AUDITLOG_OLDVALUE",
                type: "CLOB",
            },
            {
                name: "newValue",
                column: "AUDITLOG_NEWVALUE",
                type: "CLOB",
            },
            {
                name: "createdAt",
                column: "AUDITLOG_CREATEDAT",
                type: "TIMESTAMP",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AuditLogRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: AuditLogEntityOptions = {}): AuditLogEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: AuditLogEntityOptions = {}): AuditLogEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AuditLogCreateEntity): number {
        // @ts-ignore
        (entity as AuditLogEntity).createdAt = new Date();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SAMPLE_BANK_AUDITLOG",
            entity: entity,
            key: {
                name: "id",
                column: "AUDITLOG_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AuditLogUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SAMPLE_BANK_AUDITLOG",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "id",
                column: "AUDITLOG_ID",
                value: entity.id
            }
        });
    }

    public upsert(entity: AuditLogCreateEntity | AuditLogUpdateEntity): number {
        const id = (entity as AuditLogUpdateEntity).id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AuditLogUpdateEntity);
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
            table: "SAMPLE_BANK_AUDITLOG",
            entity: entity,
            key: {
                name: "id",
                column: "AUDITLOG_ID",
                value: id
            }
        });
    }

    public count(options?: AuditLogEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SAMPLE_BANK_AUDITLOG"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AuditLogEntityEvent | AuditLogUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-sample-edm-bank-core-auditLogs-AuditLog", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-sample-edm-bank-core-auditLogs-AuditLog").send(JSON.stringify(data));
    }
}
