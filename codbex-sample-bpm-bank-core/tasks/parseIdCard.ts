import { Process } from '@aerokit/sdk/bpm';
import { Configurations } from '@aerokit/sdk/core';
import { TextractClient } from 'codbex-aws-clients/textract/TextractClient';
import { Tracer } from '../utils/Tracer';

const tracer = new Tracer();

try {
    const documentPath = Process.getExecutionContext().getVariable('documentPath');
    const bucketName = Configurations.get('DIRIGIBLE_S3_BUCKET');

    if (!bucketName) {
        throw new Error(`Provide the 'DIRIGIBLE_S3_BUCKET' environment variable`);
    }

    const client = new TextractClient();
    const result = client.analyzeDocument({
        Document: {
            S3Object: {
                Bucket: bucketName,
                Name: `default-tenant/${documentPath}`
            }
        },
        FeatureTypes: ['FORMS', 'TABLES']
    });

    const idCardData = extractKeyValuePairs(result.Blocks);

    Process.getExecutionContext().setVariable('idCardData', idCardData);

    tracer.complete('ID Card data extracted successfully.');
} catch (e: any) {
    tracer.fail(e.message);
    throw e;
}

function extractKeyValuePairs(blocks) {
    const byId = new Map(blocks.map(b => [b.Id, b]));

    function getTextFromBlock(block) {
        if (!block || !block.Relationships) return '';
        const childRel = block.Relationships.find(r => r.Type === 'CHILD');
        if (!childRel) return '';
        const texts = [];
        for (const id of childRel.Ids) {
            const child = byId.get(id);
            if (!child) continue;
            if (child.BlockType === 'WORD' || child.BlockType === 'LINE') {
                if (child.Text) texts.push(child.Text);
            } else if (child.BlockType === 'SELECTION_ELEMENT') {
                if (child.SelectionStatus === 'SELECTED') texts.push('[X]');
            }
        }
        return texts.join(' ').replace(/\s+/g, ' ').trim();
    }

    const result = {};

    // Primary extraction: KEY_VALUE_SET pairs
    for (const block of blocks) {
        if (block.BlockType === 'KEY_VALUE_SET' && Array.isArray(block.EntityTypes) && block.EntityTypes.includes('KEY')) {
            const keyText = getTextFromBlock(block);
            const valueRel = (block.Relationships || []).find(r => r.Type === 'VALUE');
            let valueText = '';
            if (valueRel) {
                const valueParts = [];
                for (const vid of valueRel.Ids) {
                    const vBlock = byId.get(vid);
                    if (!vBlock) continue;
                    const t = getTextFromBlock(vBlock);
                    if (t) valueParts.push(t);
                }
                valueText = valueParts.join(' ').replace(/\s+/g, ' ').trim();
            }
            if (keyText) {
                result[keyText] = valueText;
            }
        }
    }

    // Fallback: split LINE text on runs of 2+ spaces to separate key and value
    for (const block of blocks) {
        if (block.BlockType !== 'LINE' || !block.Text) continue;
        const text = block.Text.trim();
        const parts = text.split(/\s{2,}/);
        if (parts.length >= 2) {
            const keyCandidate = parts[0].trim();
            const valueCandidate = parts.slice(1).join(' ').trim();
            if (keyCandidate && !(keyCandidate in result)) {
                result[keyCandidate] = valueCandidate;
            }
        }
    }

    return result;
}