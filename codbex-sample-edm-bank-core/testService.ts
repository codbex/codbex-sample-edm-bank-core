import { Response } from '@aerokit/sdk/http';
import { Operator, Direction } from '@aerokit/sdk/db';
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
const filteredAccounts = repository.findAll({
    conditions: [
        {
            operator: Operator.GE,
            propertyName: 'balance',
            value: 10000
        }
    ],
    sorts: [
        {
            direction: Direction.DESC,
            propertyName: 'balance'
        }
    ],
})

Response.println(`Account id = ${accountId}`);
Response.println(`-------`);
Response.println(`Account entity = ${JSON.stringify(accountEntity, null, 4)}`);
Response.println(`-------`);
Response.println(`All accounts count = ${allAccounts.length}`);
Response.println(`-------`);
Response.println(`Filtered Accounts (${filteredAccounts.length}) = ${JSON.stringify(filteredAccounts, null, 4)}`);