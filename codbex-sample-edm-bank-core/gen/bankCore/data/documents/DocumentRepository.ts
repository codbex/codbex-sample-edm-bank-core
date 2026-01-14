import { Repository, EntityEvent, EntityConstructor } from '@aerokit/sdk/db'
import { Component } from '@aerokit/sdk/component'
import { Producer } from '@aerokit/sdk/messaging'
import { Extensions } from '@aerokit/sdk/extensions'
import { DocumentEntity } from './DocumentEntity'

@Component('DocumentRepository')
export class DocumentRepository extends Repository<DocumentEntity> {

    constructor() {
        super((DocumentEntity as EntityConstructor));
    }

    public override create(entity: DocumentEntity): string | number {
        entity.uploadedAt = new Date();
        return super.create(entity);
    }

    public override upsert(entity: DocumentEntity): string | number {
        entity.uploadedAt = new Date();
        return super.upsert(entity);
    }

    protected override async triggerEvent(data: EntityEvent<DocumentEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-documents-Document', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-sample-edm-bank-core-documents-Document').send(JSON.stringify(data));
    }
}
