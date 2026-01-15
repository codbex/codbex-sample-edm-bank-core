import { Controller, Get, Post, Put, Delete, Documentation, request, response } from '@aerokit/sdk/http'
import { HttpUtils } from "@aerokit/sdk/http/utils";
import { ValidationError } from '@aerokit/sdk/http/errors'
import { Options } from '@aerokit/sdk/db'
import { Extensions } from "@aerokit/sdk/extensions"
import { Injected, Inject } from '@aerokit/sdk/component'
import { CustomerRepository } from '../../data/customers/CustomerRepository'
import { CustomerEntity } from '../../data/customers/CustomerEntity'

const validationModules = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-customers-Customer', ['validate']);

@Controller
@Documentation('codbex-sample-edm-bank-core - Customer Controller')
@Injected()
class CustomerController {

    @Inject('CustomerRepository')
    private readonly repository!: CustomerRepository;

    @Get('/')
    @Documentation('Get All Customer')
    public getAll(_: any, ctx: any): CustomerEntity[] {
        try {
            const options: Options = {
                limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : 20,
                offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : 0,
                language: request.getLocale().slice(0, 2)
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/')
    @Documentation('Create Customer')
    public create(entity: CustomerEntity): CustomerEntity {
        try {
            this.validateEntity(entity);
            entity.id = this.repository.create(entity) as any;
            response.setHeader('Content-Location', '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/customers/CustomerService.ts/' + entity.id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/count')
    @Documentation('Count Customer')
    public count(): { count: number } {
        try {
            return { count: this.repository.count() };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/count')
    @Documentation('Count Customer with filter')
    public countWithFilter(filter: any): { count: number } {
        try {
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/search')
    @Documentation('Search Customer')
    public search(filter: any): CustomerEntity[] {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/:id')
    @Documentation('Get Customer by id')
    public getById(_: any, ctx: any): CustomerEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const options: Options = {
                language: request.getLocale().slice(0, 2)
            };
            const entity = this.repository.findById(id, options);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound('Customer not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Put('/:id')
    @Documentation('Update Customer by id')
    public update(entity: CustomerEntity, ctx: any): CustomerEntity {
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
    @Documentation('Delete Customer by id')
    public deleteById(_: any, ctx: any): void {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound('Customer not found');
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
        if (entity.customerNumber === null || entity.customerNumber === undefined) {
            throw new ValidationError(`The 'customerNumber' property is required, provide a valid value`);
        }
        if (entity.customerNumber?.length > 20) {
            throw new ValidationError(`The 'customerNumber' exceeds the maximum length of [20] characters`);
        }
        if (entity.type?.length > 1) {
            throw new ValidationError(`The 'type' exceeds the maximum length of [1] characters`);
        }
        if (entity.firstName === null || entity.firstName === undefined) {
            throw new ValidationError(`The 'firstName' property is required, provide a valid value`);
        }
        if (entity.firstName?.length > 100) {
            throw new ValidationError(`The 'firstName' exceeds the maximum length of [100] characters`);
        }
        if (entity.lastName === null || entity.lastName === undefined) {
            throw new ValidationError(`The 'lastName' property is required, provide a valid value`);
        }
        if (entity.lastName?.length > 100) {
            throw new ValidationError(`The 'lastName' exceeds the maximum length of [100] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
