import { sql, query } from "@aerokit/sdk/db";
import { producer } from "@aerokit/sdk/messaging";
import { extensions } from "@aerokit/sdk/extensions";
import { dao as daoApi } from "@aerokit/sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CustomerEntity {
    readonly id: number;
    customerNumber: string;
    type?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    isActive?: boolean;
    riskScore?: number;
    profileNotes?: unknown;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CustomerCreateEntity {
    readonly customerNumber: string;
    readonly type?: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly dateOfBirth?: Date;
    readonly isActive?: boolean;
    readonly riskScore?: number;
    readonly profileNotes?: unknown;
}

export interface CustomerUpdateEntity extends CustomerCreateEntity {
    readonly id: number;
}

export interface CustomerEntityOptions {
    $filter?: {
        equals?: {
            id?: number | number[];
            customerNumber?: string | string[];
            type?: string | string[];
            firstName?: string | string[];
            lastName?: string | string[];
            dateOfBirth?: Date | Date[];
            isActive?: boolean | boolean[];
            riskScore?: number | number[];
            profileNotes?: unknown | unknown[];
            createdAt?: Date | Date[];
            updatedAt?: Date | Date[];
        };
        notEquals?: {
            id?: number | number[];
            customerNumber?: string | string[];
            type?: string | string[];
            firstName?: string | string[];
            lastName?: string | string[];
            dateOfBirth?: Date | Date[];
            isActive?: boolean | boolean[];
            riskScore?: number | number[];
            profileNotes?: unknown | unknown[];
            createdAt?: Date | Date[];
            updatedAt?: Date | Date[];
        };
        contains?: {
            id?: number;
            customerNumber?: string;
            type?: string;
            firstName?: string;
            lastName?: string;
            dateOfBirth?: Date;
            isActive?: boolean;
            riskScore?: number;
            profileNotes?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
        greaterThan?: {
            id?: number;
            customerNumber?: string;
            type?: string;
            firstName?: string;
            lastName?: string;
            dateOfBirth?: Date;
            isActive?: boolean;
            riskScore?: number;
            profileNotes?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
        greaterThanOrEqual?: {
            id?: number;
            customerNumber?: string;
            type?: string;
            firstName?: string;
            lastName?: string;
            dateOfBirth?: Date;
            isActive?: boolean;
            riskScore?: number;
            profileNotes?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
        lessThan?: {
            id?: number;
            customerNumber?: string;
            type?: string;
            firstName?: string;
            lastName?: string;
            dateOfBirth?: Date;
            isActive?: boolean;
            riskScore?: number;
            profileNotes?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
        lessThanOrEqual?: {
            id?: number;
            customerNumber?: string;
            type?: string;
            firstName?: string;
            lastName?: string;
            dateOfBirth?: Date;
            isActive?: boolean;
            riskScore?: number;
            profileNotes?: unknown;
            createdAt?: Date;
            updatedAt?: Date;
        };
    },
    $select?: (keyof CustomerEntity)[],
    $sort?: string | (keyof CustomerEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface CustomerEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CustomerEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface CustomerUpdateEntityEvent extends CustomerEntityEvent {
    readonly previousEntity: CustomerEntity;
}

export class CustomerRepository {

    private static readonly DEFINITION = {
        table: "SAMPLE_BANK_CUSTOMER",
        properties: [
            {
                name: "id",
                column: "CUSTOMER_ID",
                type: "BIGINT",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "customerNumber",
                column: "CUSTOMER_CUSTOMERNUMBER",
                type: "VARCHAR",
                required: true
            },
            {
                name: "type",
                column: "CUSTOMER_TYPE",
                type: "CHAR",
            },
            {
                name: "firstName",
                column: "CUSTOMER_FIRSTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "lastName",
                column: "CUSTOMER_LASTNAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "dateOfBirth",
                column: "CUSTOMER_DATEOFBIRTH",
                type: "DATE",
            },
            {
                name: "isActive",
                column: "CUSTOMER_ISACTIVE",
                type: "BOOLEAN",
            },
            {
                name: "riskScore",
                column: "CUSTOMER_RISKSCORE",
                type: "REAL",
            },
            {
                name: "profileNotes",
                column: "CUSTOMER_PROFILENOTES",
                type: "CLOB",
            },
            {
                name: "createdAt",
                column: "CUSTOMER_CREATEDAT",
                type: "TIMESTAMP",
            },
            {
                name: "updatedAt",
                column: "CUSTOMER_UPDATEDAT",
                type: "TIMESTAMP",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CustomerRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: CustomerEntityOptions = {}): CustomerEntity[] {
        let list = this.dao.list(options).map((e: CustomerEntity) => {
            EntityUtils.setDate(e, "dateOfBirth");
            EntityUtils.setBoolean(e, "isActive");
            return e;
        });
        return list;
    }

    public findById(id: number, options: CustomerEntityOptions = {}): CustomerEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "dateOfBirth");
        EntityUtils.setBoolean(entity, "isActive");
        return entity ?? undefined;
    }

    public create(entity: CustomerCreateEntity): number {
        EntityUtils.setLocalDate(entity, "dateOfBirth");
        EntityUtils.setBoolean(entity, "isActive");
        // @ts-ignore
        (entity as CustomerEntity).createdAt = new Date();
        if (entity.type === undefined || entity.type === null) {
            (entity as CustomerEntity).type = "'I'";
        }
        if (entity.isActive === undefined || entity.isActive === null) {
            (entity as CustomerEntity).isActive = true;
        }
        if (entity.riskScore === undefined || entity.riskScore === null) {
            (entity as CustomerEntity).riskScore = 0;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SAMPLE_BANK_CUSTOMER",
            entity: entity,
            key: {
                name: "id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CustomerUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "dateOfBirth");
        EntityUtils.setBoolean(entity, "isActive");
        // @ts-ignore
        (entity as CustomerEntity).updatedAt = new Date();
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SAMPLE_BANK_CUSTOMER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "id",
                column: "CUSTOMER_ID",
                value: entity.id
            }
        });
    }

    public upsert(entity: CustomerCreateEntity | CustomerUpdateEntity): number {
        const id = (entity as CustomerUpdateEntity).id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CustomerUpdateEntity);
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
            table: "SAMPLE_BANK_CUSTOMER",
            entity: entity,
            key: {
                name: "id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
    }

    public count(options?: CustomerEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SAMPLE_BANK_CUSTOMER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CustomerEntityEvent | CustomerUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-sample-edm-bank-core-customers-Customer", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-sample-edm-bank-core-customers-Customer").send(JSON.stringify(data));
    }
}
