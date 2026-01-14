import { sql, query } from "@aerokit/sdk/db";
import { producer } from "@aerokit/sdk/messaging";
import { extensions } from "@aerokit/sdk/extensions";
import { dao as daoApi } from "@aerokit/sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AccountEntity {
    readonly id: number;
    iban?: string;
    customerId: number;
    currency?: string;
    balance?: number;
    overdraftLimit?: number;
    status?: number;
    openedOn?: Date;
    lastAccessTime?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AccountCreateEntity {
    readonly iban?: string;
    readonly customerId: number;
    readonly currency?: string;
    readonly balance?: number;
    readonly overdraftLimit?: number;
    readonly status?: number;
    readonly openedOn?: Date;
    readonly lastAccessTime?: Date;
}

export interface AccountUpdateEntity extends AccountCreateEntity {
    readonly id: number;
}

export interface AccountEntityOptions {
    $filter?: {
        equals?: {
            id?: number | number[];
            iban?: string | string[];
            customerId?: number | number[];
            currency?: string | string[];
            balance?: number | number[];
            overdraftLimit?: number | number[];
            status?: number | number[];
            openedOn?: Date | Date[];
            lastAccessTime?: Date | Date[];
            createdAt?: Date | Date[];
            updatedAt?: Date | Date[];
        };
        notEquals?: {
            id?: number | number[];
            iban?: string | string[];
            customerId?: number | number[];
            currency?: string | string[];
            balance?: number | number[];
            overdraftLimit?: number | number[];
            status?: number | number[];
            openedOn?: Date | Date[];
            lastAccessTime?: Date | Date[];
            createdAt?: Date | Date[];
            updatedAt?: Date | Date[];
        };
        contains?: {
            id?: number;
            iban?: string;
            customerId?: number;
            currency?: string;
            balance?: number;
            overdraftLimit?: number;
            status?: number;
            openedOn?: Date;
            lastAccessTime?: Date;
            createdAt?: Date;
            updatedAt?: Date;
        };
        greaterThan?: {
            id?: number;
            iban?: string;
            customerId?: number;
            currency?: string;
            balance?: number;
            overdraftLimit?: number;
            status?: number;
            openedOn?: Date;
            lastAccessTime?: Date;
            createdAt?: Date;
            updatedAt?: Date;
        };
        greaterThanOrEqual?: {
            id?: number;
            iban?: string;
            customerId?: number;
            currency?: string;
            balance?: number;
            overdraftLimit?: number;
            status?: number;
            openedOn?: Date;
            lastAccessTime?: Date;
            createdAt?: Date;
            updatedAt?: Date;
        };
        lessThan?: {
            id?: number;
            iban?: string;
            customerId?: number;
            currency?: string;
            balance?: number;
            overdraftLimit?: number;
            status?: number;
            openedOn?: Date;
            lastAccessTime?: Date;
            createdAt?: Date;
            updatedAt?: Date;
        };
        lessThanOrEqual?: {
            id?: number;
            iban?: string;
            customerId?: number;
            currency?: string;
            balance?: number;
            overdraftLimit?: number;
            status?: number;
            openedOn?: Date;
            lastAccessTime?: Date;
            createdAt?: Date;
            updatedAt?: Date;
        };
    },
    $select?: (keyof AccountEntity)[],
    $sort?: string | (keyof AccountEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface AccountEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AccountEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface AccountUpdateEntityEvent extends AccountEntityEvent {
    readonly previousEntity: AccountEntity;
}

export class AccountRepository {

    private static readonly DEFINITION = {
        table: "SAMPLE_BANK_ACCOUNT",
        properties: [
            {
                name: "id",
                column: "ACCOUNT_ID",
                type: "BIGINT",
                id: true,
                autoIncrement: true,
            },
            {
                name: "iban",
                column: "ACCOUNT_IBAN",
                type: "VARCHAR",
            },
            {
                name: "customerId",
                column: "ACCOUNT_CUSTOMERID",
                type: "BIGINT",
                required: true
            },
            {
                name: "currency",
                column: "ACCOUNT_CURRENCY",
                type: "CHAR",
            },
            {
                name: "balance",
                column: "ACCOUNT_BALANCE",
                type: "DECIMAL",
            },
            {
                name: "overdraftLimit",
                column: "ACCOUNT_OVERDRAFTLIMIT",
                type: "DECIMAL",
            },
            {
                name: "status",
                column: "ACCOUNT_STATUS",
                type: "SMALLINT",
            },
            {
                name: "openedOn",
                column: "ACCOUNT_OPENEDON",
                type: "DATE",
            },
            {
                name: "lastAccessTime",
                column: "ACCOUNT_LASTACCESSTIME",
                type: "TIME",
            },
            {
                name: "createdAt",
                column: "ACCOUNT_CREATEDAT",
                type: "TIMESTAMP",
            },
            {
                name: "updatedAt",
                column: "ACCOUNT_UPDATEDAT",
                type: "TIME",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AccountRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: AccountEntityOptions = {}): AccountEntity[] {
        let list = this.dao.list(options).map((e: AccountEntity) => {
            EntityUtils.setDate(e, "openedOn");
            return e;
        });
        return list;
    }

    public findById(id: number, options: AccountEntityOptions = {}): AccountEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "openedOn");
        return entity ?? undefined;
    }

    public create(entity: AccountCreateEntity): number {
        EntityUtils.setLocalDate(entity, "openedOn");
        // @ts-ignore
        (entity as AccountEntity).createdAt = new Date();
        if (entity.currency === undefined || entity.currency === null) {
            (entity as AccountEntity).currency = "'EUR'";
        }
        if (entity.balance === undefined || entity.balance === null) {
            (entity as AccountEntity).balance = 0;
        }
        if (entity.overdraftLimit === undefined || entity.overdraftLimit === null) {
            (entity as AccountEntity).overdraftLimit = 0;
        }
        if (entity.status === undefined || entity.status === null) {
            (entity as AccountEntity).status = 1;
        }
        if (entity.openedOn === undefined || entity.openedOn === null) {
            (entity as AccountEntity).openedOn = new Date("CURRENT_DATE");
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SAMPLE_BANK_ACCOUNT",
            entity: entity,
            key: {
                name: "id",
                column: "ACCOUNT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AccountUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "openedOn");
        // @ts-ignore
        (entity as AccountEntity).updatedAt = new Date();
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SAMPLE_BANK_ACCOUNT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "id",
                column: "ACCOUNT_ID",
                value: entity.id
            }
        });
    }

    public upsert(entity: AccountCreateEntity | AccountUpdateEntity): number {
        const id = (entity as AccountUpdateEntity).id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AccountUpdateEntity);
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
            table: "SAMPLE_BANK_ACCOUNT",
            entity: entity,
            key: {
                name: "id",
                column: "ACCOUNT_ID",
                value: id
            }
        });
    }

    public count(options?: AccountEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SAMPLE_BANK_ACCOUNT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AccountEntityEvent | AccountUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-sample-edm-bank-core-accounts-Account", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-sample-edm-bank-core-accounts-Account").send(JSON.stringify(data));
    }
}
