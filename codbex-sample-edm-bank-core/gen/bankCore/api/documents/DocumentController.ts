import { Controller, Get, Post, Put, Delete, Documentation, request, response } from '@aerokit/sdk/http'
import { Injected, Inject } from '@aerokit/sdk/component'
import { Options } from '@aerokit/sdk/db'
import { Extensions } from "@aerokit/sdk/extensions"
import { ValidationError } from '@aerokit/sdk/http/errors'
import { HttpUtils } from "@aerokit/sdk/http/utils";
import { DocumentRepository } from '../../data/documents/DocumentRepository'
import { DocumentEntity } from '../../data/documents/DocumentEntity'

const validationModules = await Extensions.loadExtensionModules('codbex-sample-edm-bank-core-documents-Document', ['validate']);

@Controller
@Documentation('codbex-sample-edm-bank-core - Document Controller')
@Injected()
class DocumentController {

    @Inject('DocumentRepository')
    private readonly repository!: DocumentRepository;

    @Get('/')
    @Documentation('Get All Document')
    public getAll(_: any, ctx: any): DocumentEntity[] {
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
    @Documentation('Create Document')
    public create(entity: DocumentEntity): DocumentEntity {
        try {
            this.validateEntity(entity);
            entity.id = this.repository.create(entity);
            response.setHeader('Content-Location', '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/documents/DocumentService.ts/' + entity.id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/count')
    @Documentation('Count Document')
    public count(): { count: number } {
        try {
            return { count: this.repository.count() };
        } catch (error: any) {
            this.handleError(error);
        }
        return { count: -1 };
    }

    @Post('/count')
    @Documentation('Count Document with filter')
    public countWithFilter(filter: any): { count: number } {
        try {
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
        return { count: -1 };
    }

    @Post('/search')
    @Documentation('Search Document')
    public search(filter: any): DocumentEntity[] {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/:id')
    @Documentation('Get Document by id')
    public getById(_: any, ctx: any): DocumentEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const options: DocumentEntityOptions = {
                $language: request.getLocale().slice(0, 2)
            };
            const entity = this.repository.findById(id, options);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound('Document not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Put('/:id')
    @Documentation('Update Document by id')
    public update(entity: DocumentEntity, ctx: any): DocumentEntity {
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
    @Documentation('Delete Document by id')
    public deleteById(_: any, ctx: any): void {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound('Document not found');
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
        if (entity.documentType === null || entity.documentType === undefined) {
            throw new ValidationError(`The 'documentType' property is required, provide a valid value`);
        }
        if (entity.documentType?.length > 50) {
            throw new ValidationError(`The 'documentType' exceeds the maximum length of [50] characters`);
        }
        if (entity.fileName === null || entity.fileName === undefined) {
            throw new ValidationError(`The 'fileName' property is required, provide a valid value`);
        }
        if (entity.fileName?.length > 255) {
            throw new ValidationError(`The 'fileName' exceeds the maximum length of [255] characters`);
        }
        if (entity.checksum?.length > 64) {
            throw new ValidationError(`The 'checksum' exceeds the maximum length of [64] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
