import { Controller, Get, Post } from '@aerokit/sdk/http';
import { Tasks } from '@aerokit/sdk/bpm';

@Controller
class AccountDataService {

    @Get('/')
    public getAccountData(_: any, ctx: any) {
        const taskId = ctx.queryParameters['taskId'];

        const customerData = Tasks.getVariable(taskId, 'customerData');
        const customerNumber = Tasks.getVariable(taskId, 'customerNumber');

        return {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            dateOfBirth: customerData.dateOfBirth,
            profileNotes: customerData.profileNotes,
            customerNumber: customerNumber,
        };
    }


    @Post('/')
    public submitAccountData(accountData: any, ctx: any) {
        const taskId = ctx.queryParameters['taskId'];
        Tasks.complete(taskId, {
            initialBalance: accountData.initialBalance
        });
        return {
            status: 'Success'
        };
    }
}