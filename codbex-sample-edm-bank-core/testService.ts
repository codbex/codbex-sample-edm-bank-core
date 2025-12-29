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

const allAccounts = repository.findAll();

Response.println(`Account id = ${accountId}`);
Response.println(`-------`);
Response.println(`Account entity = ${JSON.stringify(accountEntity, null, 4)}`);
Response.println(`-------`);
Response.println(`All accounts = ${JSON.stringify(allAccounts, null, 4)}`);
Response.println(`-------`);