import { sql, query } from "@aerokit/sdk/db";
import { producer } from "@aerokit/sdk/messaging";
import { extensions } from "@aerokit/sdk/extensions";
import { dao as daoApi } from "@aerokit/sdk/db";

export interface TransactionEntity {
    readonly id: number;
    accountId: number;
    reference: string;
    amount: number;
    direction: string;
    fee?: number;
    exchangeRate?: number;
    approved?: boolean;
    createdOn?: Date;
}

export interface TransactionCreateEntity {
    readonly accountId: number;
    readonly reference: string;
    readonly amount: number;
    readonly direction: string;
    readonly fee?: number;
    readonly exchangeRate?: number;
    readonly approved?: boolean;
}

export interface TransactionUpdateEntity extends TransactionCreateEntity {
    readonly id: number;
}

export interface TransactionEntityOptions {
    $filter?: {
        equals?: {
            id?: number | number[];
            accountId?: number | number[];
            reference?: string | string[];
            amount?: number | number[];
            direction?: string | string[];
            fee?: number | number[];
            exchangeRate?: number | number[];
            approved?: boolean | boolean[];
            createdOn?: Date | Date[];
        };
        notEquals?: {
            id?: number | number[];
            accountId?: number | number[];
            reference?: string | string[];
            amount?: number | number[];
            direction?: string | string[];
            fee?: number | number[];
            exchangeRate?: number | number[];
            approved?: boolean | boolean[];
            createdOn?: Date | Date[];
        };
        contains?: {
            id?: number;
            accountId?: number;
            reference?: string;
            amount?: number;
            direction?: string;
            fee?: number;
            exchangeRate?: number;
            approved?: boolean;
            createdOn?: Date;
        };
        greaterThan?: {
            id?: number;
            accountId?: number;
            reference?: string;
            amount?: number;
            direction?: string;
            fee?: number;
            exchangeRate?: number;
            approved?: boolean;
            createdOn?: Date;
        };
        greaterThanOrEqual?: {
            id?: number;
            accountId?: number;
            reference?: string;
            amount?: number;
            direction?: string;
            fee?: number;
            exchangeRate?: number;
            approved?: boolean;
            createdOn?: Date;
        };
        lessThan?: {
            id?: number;
            accountId?: number;
            reference?: string;
            amount?: number;
            direction?: string;
            fee?: number;
            exchangeRate?: number;
            approved?: boolean;
            createdOn?: Date;
        };
        lessThanOrEqual?: {
            id?: number;
            accountId?: number;
            reference?: string;
            amount?: number;
            direction?: string;
            fee?: number;
            exchangeRate?: number;
            approved?: boolean;
            createdOn?: Date;
        };
    },
    $select?: (keyof TransactionEntity)[],
    $sort?: string | (keyof TransactionEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface TransactionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TransactionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface TransactionUpdateEntityEvent extends TransactionEntityEvent {
    readonly previousEntity: TransactionEntity;
}

export class TransactionRepository {

    private static readonly DEFINITION = {
        table: "SAMPLE_BANK_TRANSACTION",
        properties: [
            {
                name: "id",
                column: "TRANSACTION_ID",
                type: "BIGINT",
                id: true,
                autoIncrement: true,
            },
            {
                name: "accountId",
                column: "TRANSACTION_ACCOUNTID",
                type: "BIGINT",
                required: true
            },
            {
                name: "reference",
                column: "TRANSACTION_REFERENCE",
                type: "VARCHAR",
                required: true
            },
            {
                name: "amount",
                column: "TRANSACTION_AMOUNT",
                type: "DECIMAL",
                required: true
            },
            {
                name: "direction",
                column: "TRANSACTION_DIRECTION",
                type: "CHAR",
                required: true
            },
            {
                name: "fee",
                column: "TRANSACTION_FEE",
                type: "DOUBLE",
            },
            {
                name: "exchangeRate",
                column: "TRANSACTION_EXCHANGERATE",
                type: "REAL",
            },
            {
                name: "approved",
                column: "TRANSACTION_APPROVED",
                type: "BIT",
            },
            {
                name: "createdOn",
                column: "TRANSACTION_CREATEDON",
                type: "TIMESTAMP",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(TransactionRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: TransactionEntityOptions = {}): TransactionEntity[] {
        let list = this.dao.list(options);
        return list;
    }

    public findById(id: number, options: TransactionEntityOptions = {}): TransactionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: TransactionCreateEntity): number {
        // @ts-ignore
        (entity as TransactionEntity).createdOn = new Date();
        if (entity.fee === undefined || entity.fee === null) {
            (entity as TransactionEntity).fee = 0;
        }
        if (entity.approved === undefined || entity.approved === null) {
            (entity as TransactionEntity).approved = false;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SAMPLE_BANK_TRANSACTION",
            entity: entity,
            key: {
                name: "id",
                column: "TRANSACTION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TransactionUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SAMPLE_BANK_TRANSACTION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "id",
                column: "TRANSACTION_ID",
                value: entity.id
            }
        });
    }

    public upsert(entity: TransactionCreateEntity | TransactionUpdateEntity): number {
        const id = (entity as TransactionUpdateEntity).id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TransactionUpdateEntity);
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
            table: "SAMPLE_BANK_TRANSACTION",
            entity: entity,
            key: {
                name: "id",
                column: "TRANSACTION_ID",
                value: id
            }
        });
    }

    public count(options?: TransactionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SAMPLE_BANK_TRANSACTION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TransactionEntityEvent | TransactionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-sample-edm-bank-core-accounts-Transaction", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-sample-edm-bank-core-accounts-Transaction").send(JSON.stringify(data));
    }
}
