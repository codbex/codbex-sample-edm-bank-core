import { Repository, EntityEvent, EntityConstructor } from '@aerokit/sdk/db'
import { Component } from '@aerokit/sdk/component'
import { Producer } from '@aerokit/sdk/messaging'
import { Extensions } from '@aerokit/sdk/extensions'
import { TransactionEntity } from './TransactionEntity'

@Component('TransactionRepository')
export class TransactionRepository extends Repository<TransactionEntity> {

    constructor() {
        super((TransactionEntity as EntityConstructor));
    }

    public override create(entity: TransactionEntity): string | number {
        entity.createdOn = new Date();
        return super.create(entity);
    }

    public override upsert(entity: TransactionEntity): string | number {
        entity.createdOn = new Date();
        return super.upsert(entity);
    }

    protected override async triggerEvent(data: EntityEvent<TransactionEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-accounts-Transaction', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-sample-edm-bank-core-accounts-Transaction').send(JSON.stringify(data));
    }
}
