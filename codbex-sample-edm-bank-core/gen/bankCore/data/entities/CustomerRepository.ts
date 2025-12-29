import { Repository, EntityEvent, EntityConstructor } from '@aerokit/sdk/db';
import { Producer } from '@aerokit/sdk/messaging';
import { Extensions } from '@aerokit/sdk/extensions';
import { CustomerEntity } from './CustomerEntity';

export class CustomerRepository extends Repository<CustomerEntity> {

    constructor() {
        super((CustomerEntity as EntityConstructor));
    }

    public override create(entity: CustomerEntity): string | number {
        entity.createdAt = new Date();
        return super.create(entity);
    }

    public override update(entity: CustomerEntity): void {
        entity.updatedAt = new Date();
        super.update(entity);
    }

    public override upsert(entity: CustomerEntity): string | number {
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        return super.upsert(entity);
    }

    protected override async triggerEvent(data: EntityEvent<CustomerEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-entities-Customer', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-sample-edm-bank-core-entities-Customer').send(JSON.stringify(data));
    }
}
