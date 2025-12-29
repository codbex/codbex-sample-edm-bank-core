import { Response } from '@aerokit/sdk/http';
import { UUID } from '@aerokit/sdk/utils';
import { AccountRepository } from './gen/bankCore/data/accounts/AccountRepository';

const repository = new AccountRepository();

const accountId = repository.create({
    customerId: 1,
    iban: UUID.random().substring(0, 34)
});

const accountEntity = repository.findById(accountId);

if (!accountEntity) {
    throw new Error(`Account entity with id = ${accountId} not found`);
}

Response.println(`Account id = ${accountId}`);
Response.println(`Account entity = ${JSON.stringify(accountEntity)}`);