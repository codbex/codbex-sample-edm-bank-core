import { Process } from '@aerokit/sdk/bpm';
import { UUID } from '@aerokit/sdk/utils';
import { AccountRepository } from 'codbex-sample-edm-bank-core/gen/bankCore/data/accounts/AccountRepository';
import { Tracer } from '../utils/Tracer';


const tracer = new Tracer();

try {
    const customerId: number = Process.getExecutionContext().getVariable('customerId');
    const initialBalance: number = Process.getExecutionContext().getVariable('initialBalance');

    const repository = new AccountRepository();

    const accountId = repository.create({
        customerId: customerId,
        iban: UUID.random().replace(/-/g, '').substring(0, 34).toUpperCase(),
        balance: initialBalance,
        // currency defaults to EUR
        // status defaults to 1
        // overdraftLimit defaults to 0
    });

    Process.getExecutionContext().setVariable('accountId', accountId);

    tracer.complete(`Account created with id=[${accountId}].`);
} catch (e: any) {
    tracer.fail(e.message);
    throw e;
}
