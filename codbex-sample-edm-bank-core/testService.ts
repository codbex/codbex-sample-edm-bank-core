import { Response } from '@aerokit/sdk/http';
import { Operator, Direction } from '@aerokit/sdk/db';
import { UUID } from '@aerokit/sdk/utils';
import { AccountRepository } from './gen/bankCore/data/accounts/AccountRepository';

const repository = new AccountRepository();

const accountId = repository.create({
    customerId: 1,
    iban: UUID.random().substring(0, 34),
    balance: parseInt('' + Math.random() * 1000),
    // currency: 'USD',
});

const accountEntity = repository.findById(accountId);

if (!accountEntity) {
    throw new Error(`Account entity with id = ${accountId} not found`);
}

accountEntity.balance += 1234500;

repository.update(accountEntity);

const allAccounts = repository.findAll();

const filteredAccounts = repository.findAll({
    conditions: [
        {
            operator: Operator.LE,
            propertyName: 'balance',
            value: 400
        },
        {
            operator: Operator.LIKE,
            propertyName: 'iban',
            value: '%38%'
        },
        {
            operator: Operator.IN,
            propertyName: 'currency',
            value: ['EUR', 'USD']
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
Response.println(`Filtered Accounts (${filteredAccounts.length}) = ${JSON.stringify(filteredAccounts.map(e => { return { iban: e.iban, balance: e.balance, currency: e.currency } }), null, 4)}`);
Response.println(`-------`);