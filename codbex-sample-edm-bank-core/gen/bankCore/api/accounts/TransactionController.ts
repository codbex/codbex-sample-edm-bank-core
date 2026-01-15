import { Controller, Get, Post, Put, Delete, Documentation, request, response } from '@aerokit/sdk/http'
import { HttpUtils } from "@aerokit/sdk/http/utils";
import { ValidationError } from '@aerokit/sdk/http/errors'
import { Options } from '@aerokit/sdk/db'
import { Extensions } from "@aerokit/sdk/extensions"
import { Injected, Inject } from '@aerokit/sdk/component'
import { TransactionRepository } from '../../data/accounts/TransactionRepository'
import { TransactionEntity } from '../../data/accounts/TransactionEntity'

const validationModules = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-accounts-Transaction', ['validate']);

@Controller
@Documentation('codbex-sample-edm-bank-core - Transaction Controller')
@Injected()
class TransactionController {

    @Inject('TransactionRepository')
    private readonly repository!: TransactionRepository;

    @Get('/')
    @Documentation('Get All Transaction')
    public getAll(_: any, ctx: any): TransactionEntity[] {
        try {
            const options: Options = {
                limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : 20,
                offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : 0,
                language: request.getLocale().slice(0, 2)
            };

            let accountId = parseInt(ctx.queryParameters.accountId);
            accountId = isNaN(accountId) ? ctx.queryParameters.accountId : accountId;

            if (accountId !== undefined) {
                options.$filter = {
                    equals: {
                        accountId: accountId
                    }
                };
            }

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/')
    @Documentation('Create Transaction')
    public create(entity: TransactionEntity): TransactionEntity {
        try {
            this.validateEntity(entity);
            entity.id = this.repository.create(entity) as any;
            response.setHeader('Content-Location', '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/TransactionService.ts/' + entity.id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/count')
    @Documentation('Count Transaction')
    public count(): { count: number } {
        try {
            return { count: this.repository.count() };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/count')
    @Documentation('Count Transaction with filter')
    public countWithFilter(filter: any): { count: number } {
        try {
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/search')
    @Documentation('Search Transaction')
    public search(filter: any): TransactionEntity[] {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/:id')
    @Documentation('Get Transaction by id')
    public getById(_: any, ctx: any): TransactionEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const options: Options = {
                language: request.getLocale().slice(0, 2)
            };
            const entity = this.repository.findById(id, options);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound('Transaction not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Put('/:id')
    @Documentation('Update Transaction by id')
    public update(entity: TransactionEntity, ctx: any): TransactionEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            entity.id = id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Delete('/:id')
    @Documentation('Delete Transaction by id')
    public deleteById(_: any, ctx: any): void {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound('Transaction not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === 'ForbiddenError') {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === 'ValidationError') {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.reference === null || entity.reference === undefined) {
            throw new ValidationError(`The 'reference' property is required, provide a valid value`);
        }
        if (entity.reference?.length > 64) {
            throw new ValidationError(`The 'reference' exceeds the maximum length of [64] characters`);
        }
        if (entity.amount === null || entity.amount === undefined) {
            throw new ValidationError(`The 'amount' property is required, provide a valid value`);
        }
        if (entity.direction?.length > 1) {
            throw new ValidationError(`The 'direction' exceeds the maximum length of [1] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
