import { Process } from '@aerokit/sdk/bpm';
import { UUID } from '@aerokit/sdk/utils';
import { CustomerRepository } from 'codbex-sample-edm-bank-core/gen/bankCore/data/customers/CustomerRepository';
import { Tracer } from '../utils/Tracer';


const tracer = new Tracer();

try {
    const customerData: Record<string, any> = Process.getExecutionContext().getVariable('customerData');

    const repository = new CustomerRepository();

    const customerNumber = `CUST-${UUID.random().substring(0, 8).toUpperCase()}`;
    const customerId = repository.create({
        customerNumber: customerNumber,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        dateOfBirth: customerData.dateOfBirth,
        profileNotes: customerData.profileNotes,
        // type defaults to 'I'
        // isActive defaults to true
        // riskScore defaults to 0.0
        // createdAt calculated
    });

    Process.getExecutionContext().setVariable('customerId', customerId);
    Process.getExecutionContext().setVariable('customerNumber', customerNumber);

    tracer.complete(`Customer created with id=[${customerId}] and number=[${customerNumber}].`);
} catch (e: any) {
    tracer.fail(e.message);
    throw e;
}
