import { Response } from '@aerokit/sdk/http';
import { Operator, Direction } from '@aerokit/sdk/db';
import { UUID } from '@aerokit/sdk/utils';
import { CustomerRepository } from './gen/bankCore/data/customers/CustomerRepository';
import { AccountRepository } from './gen/bankCore/data/accounts/AccountRepository';
import { TransactionRepository } from './gen/bankCore/data/accounts/TransactionRepository';
import { DocumentRepository } from './gen/bankCore/data/documents/DocumentRepository';
import { Bytes } from '@aerokit/sdk/io';

// TODO: approved ('BIT' -> boolean with default value 0???) is not working!

const customerRepo = new CustomerRepository();

/**
 * CREATE – minimal (defaults + calculated fields)
 */
const customerId = customerRepo.create({
    customerNumber: `CUST-${UUID.random().substring(0, 8)}`,
    firstName: 'Ivan',
    lastName: 'Petrov'
    // type defaults to 'I'
    // isActive defaults to true
    // riskScore defaults to 0.0
    // createdAt calculated
});

/**
 * CREATE – full payload
 */
const vipCustomerId = customerRepo.create({
    customerNumber: `VIP-${UUID.random().substring(0, 8)}`,
    type: 'I',
    firstName: 'Maria',
    lastName: 'Ivanova',
    dateOfBirth: '1988-04-12',
    isActive: true,
    riskScore: 72.5,
    profileNotes: 'High-value customer with premium services'
});

/**
 * READ
 */
const customer = customerRepo.findById(customerId);
if (!customer) {
    throw new Error(`Customer ${customerId} not found`);
}

/**
 * UPDATE – triggers OnUpdate
 */
customer.riskScore = 15.2;
customer.profileNotes = 'Updated risk after AML review';
customerRepo.update(customer);

/**
 * QUERY
 */
const activeCustomers = customerRepo.findAll({
    conditions: [
        { operator: Operator.EQ, propertyName: 'isActive', value: true },
        { operator: Operator.GE, propertyName: 'riskScore', value: 10 }
    ],
    sorts: [
        { direction: Direction.DESC, propertyName: 'riskScore' }
    ]
});

Response.println(`Customers found = ${activeCustomers.length}`);

const accountRepo = new AccountRepository();

/**
 * CREATE – default-heavy
 */
const accountId = accountRepo.create({
    customerId,
    iban: UUID.random().replace(/-/g, '').substring(0, 34),
    balance: 1000.00
    // currency defaults to EUR
    // status defaults to 1
    // overdraftLimit defaults to 0
});

/**
 * CREATE – full
 */
const usdAccountId = accountRepo.create({
    customerId: vipCustomerId,
    iban: UUID.random().replace(/-/g, '').substring(0, 34),
    currency: 'USD',
    balance: 50000.75,
    overdraftLimit: 10000.00,
    status: 1,
    lastAccessTime: '14:35:00'
});

/**
 * UPDATE
 */
const account = accountRepo.findById(accountId)!;
account.balance += 1234.56;
account.status = 0;
accountRepo.update(account);

/**
 * QUERY
 */
const richAccounts = accountRepo.findAll({
    conditions: [
        { operator: Operator.GE, propertyName: 'balance', value: 10000 },
        { operator: Operator.IN, propertyName: 'currency', value: ['EUR', 'USD'] }
    ],
    sorts: [
        { direction: Direction.DESC, propertyName: 'balance' }
    ]
});

Response.println(`Accounts with high balance = ${richAccounts.length}`);

const transactionRepo = new TransactionRepository();

/**
 * CREATE – debit
 */
const tx1 = transactionRepo.create({
    accountId,
    reference: `TX-${UUID.random().substring(0, 12)}`,
    amount: 250.00,
    direction: 'D',
    fee: 1.25,
    // approved: 1
    approved: true
});

/**
 * CREATE – credit (minimal)
 */
const tx2 = transactionRepo.create({
    accountId,
    reference: `TX-${UUID.random().substring(0, 12)}`,
    amount: 2000.00,
    direction: 'C',
    // fee defaults to 0
    // approved defaults to 0
    approved: false
});

/**
 * QUERY
 */
const approvedTransactions = transactionRepo.findAll({
    conditions: [
        // { operator: Operator.EQ, propertyName: 'approved', value: 1 }
        { operator: Operator.EQ, propertyName: 'approved', value: true }
    ],
    sorts: [
        { direction: Direction.DESC, propertyName: 'createdOn' }
    ]
});

Response.println(`Approved transactions = ${approvedTransactions.length}`);

const documentRepo = new DocumentRepository();

/**
 * CREATE – KYC document
 */
const documentId = documentRepo.create({
    customerId,
    documentType: 'PASSPORT',
    fileName: 'passport.pdf',
    content: Bytes.textToByteArray("Hello World"),
    checksum: UUID.random()
});

/**
 * READ
 */
const document = documentRepo.findById(documentId)!;

/**
 * QUERY
 */
const customerDocs = documentRepo.findAll({
    conditions: [
        { operator: Operator.EQ, propertyName: 'customerId', value: customerId }
    ]
});

Response.println(`Customer documents = ${customerDocs.length}`);

const results = documentRepo.findAll();

for (const next of results) {
    Response.println(`BLOB: ${Bytes.byteArrayToText(next.content as any[])}`);
}
