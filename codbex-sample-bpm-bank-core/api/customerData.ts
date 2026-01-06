import { Controller, Get, Post } from '@aerokit/sdk/http';
import { Tasks } from '@aerokit/sdk/bpm';

@Controller
class CustomerDataService {

    @Get('/')
    public getCustomerData(_: any, ctx: any) {
        const taskId = ctx.queryParameters['taskId'];

        const idCardData = Tasks.getVariable(taskId, 'idCardData');

        return {
            firstName: idCardData['Име'] ?? idCardData['Name'],
            lastName: idCardData['Фамилия'] ?? idCardData[`Father's name`],
            dateOfBirth: idCardData['Дата Ha раждане/Date of birth'] ? new Date(idCardData['Дата Ha раждане/Date of birth']) : undefined,
            profileNotes: `Personal No: ${idCardData['ETH/Personal No']}\nDocument number: ${idCardData['№ Ha документа / Document number']}\nSex: ${idCardData['Пол/Sеx']}`
        };
    }


    @Post('/')
    public submitCustomerData(customerData: any, ctx: any) {
        const taskId = ctx.queryParameters['taskId'];
        Tasks.complete(taskId, {
            customerData: customerData
        });
        return {
            status: 'Success'
        };
    }
}