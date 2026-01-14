import { Controller, Get, Post, Put, Delete, Documentation, request, response } from '@aerokit/sdk/http'
import { Injected, Inject } from '@aerokit/sdk/component'
import { Options } from '@aerokit/sdk/db'
import { Extensions } from "@aerokit/sdk/extensions"
import { ValidationError } from '@aerokit/sdk/http/errors'
import { HttpUtils } from "@aerokit/sdk/http/utils";
import { AuditLogRepository } from '../../data/auditLogs/AuditLogRepository'
import { AuditLogEntity } from '../../data/auditLogs/AuditLogEntity'

const validationModules = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-auditLogs-AuditLog', ['validate']);

@Controller
@Documentation('codbex-sample-edm-bank-core - AuditLog Controller')
@Injected()
class AuditLogController {

    @Inject('AuditLogRepository')
    private readonly repository!: AuditLogRepository;

    @Get('/')
    @Documentation('Get All AuditLog')
    public getAll(_: any, ctx: any): AuditLogEntity[] {
        try {
            const options: Options = {
                limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : 20,
                offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : 0
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/')
    @Documentation('Create AuditLog')
    public create(entity: AuditLogEntity): AuditLogEntity {
        try {
            this.validateEntity(entity);
            entity.id = this.repository.create(entity);
            response.setHeader('Content-Location', '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/auditLogs/AuditLogService.ts/' + entity.id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/count')
    @Documentation('Count AuditLog')
    public count(): { count: number } {
        try {
            return { count: this.repository.count() };
        } catch (error: any) {
            this.handleError(error);
        }
        return { count: -1 };
    }

    @Post('/count')
    @Documentation('Count AuditLog with filter')
    public countWithFilter(filter: any): { count: number } {
        try {
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
        return { count: -1 };
    }

    @Post('/search')
    @Documentation('Search AuditLog')
    public search(filter: any): AuditLogEntity[] {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/:id')
    @Documentation('Get AuditLog by id')
    public getById(_: any, ctx: any): AuditLogEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const options: AuditLogEntityOptions = {
                $language: request.getLocale().slice(0, 2)
            };
            const entity = this.repository.findById(id, options);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound('AuditLog not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Put('/:id')
    @Documentation('Update AuditLog by id')
    public update(entity: AuditLogEntity, ctx: any): AuditLogEntity {
        try {
            entity.id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Delete('/:id')
    @Documentation('Delete AuditLog by id')
    public deleteById(_: any, ctx: any): void {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound('AuditLog not found');
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
        if (entity.entityName === null || entity.entityName === undefined) {
            throw new ValidationError(`The 'entityName' property is required, provide a valid value`);
        }
        if (entity.entityName?.length > 100) {
            throw new ValidationError(`The 'entityName' exceeds the maximum length of [100] characters`);
        }
        if (entity.operation === null || entity.operation === undefined) {
            throw new ValidationError(`The 'operation' property is required, provide a valid value`);
        }
        if (entity.operation?.length > 1) {
            throw new ValidationError(`The 'operation' exceeds the maximum length of [1] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
