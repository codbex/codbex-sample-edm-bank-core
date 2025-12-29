import { Repository, EntityEvent, EntityConstructor } from '@aerokit/sdk/db';
import { Producer } from '@aerokit/sdk/messaging';
import { Extensions } from '@aerokit/sdk/extensions';
import { AuditLogEntity } from './AuditLogEntity';

export class AuditLogRepository extends Repository<AuditLogEntity> {

    constructor() {
        super((AuditLogEntity as EntityConstructor));
    }

    public override create(entity: AuditLogEntity): string | number {
        entity.createdAt = new Date();
        return super.create(entity);
    }

    public override upsert(entity: AuditLogEntity): string | number {
        entity.createdAt = new Date();
        return super.upsert(entity);
    }

    protected override async triggerEvent(data: EntityEvent<AuditLogEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-entities-AuditLog', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-sample-edm-bank-core-entities-AuditLog').send(JSON.stringify(data));
    }
}
