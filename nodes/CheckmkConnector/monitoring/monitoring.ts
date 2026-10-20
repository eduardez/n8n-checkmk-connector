import type {IExecuteFunctions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {CheckmkClient} from '../transport/CheckmkClient';

function requiredString(
	context: IExecuteFunctions,
	itemIndex: number,
	parameter: string,
	label: string,
): string {
	const value = String(context.getNodeParameter(parameter, itemIndex, '')).trim();
	if (value === '') {
		throw new NodeOperationError(context.getNode(), `${label} is required`);
	}
	return value;
}

function targetParameter(context: IExecuteFunctions, itemIndex: number): 'host' | 'service' {
	const target = String(context.getNodeParameter('target', itemIndex, 'host'));
	if (target !== 'host' && target !== 'service') {
		throw new NodeOperationError(context.getNode(), `Unknown target "${target}"`);
	}
	return target;
}

/**
 * Acknowledges a host or service problem. Checkmk answers with HTTP 204 and no
 * body, so the item is emitted empty.
 */
export async function acknowledgeProblem(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
): Promise<unknown> {
	const target = targetParameter(context, itemIndex);
	const hostName = requiredString(context, itemIndex, 'hostName', 'Host name');
	const comment = requiredString(context, itemIndex, 'acknowledgementComment', 'Comment');
	const body: Record<string, unknown> = {
		acknowledge_type: target,
		host_name: hostName,
		comment,
		sticky: Boolean(context.getNodeParameter('sticky', itemIndex, true)),
		persistent: Boolean(context.getNodeParameter('persistent', itemIndex, false)),
		notify: Boolean(context.getNodeParameter('notify', itemIndex, true)),
	};
	if (target === 'service') {
		body.service_description = requiredString(
			context,
			itemIndex,
			'serviceDescription',
			'Service description',
		);
	}
	const expireOn = String(context.getNodeParameter('expireOn', itemIndex, '')).trim();
	if (expireOn !== '') body.expire_on = expireOn;

	await client.request({method: 'POST', path: `/domain-types/acknowledge/collections/${target}`, body});
	return {};
}

/**
 * Schedules a host or service downtime. Checkmk answers with HTTP 204 and no
 * body, so the item is emitted empty.
 */
export async function scheduleDowntime(
	context: IExecuteFunctions,
	client: CheckmkClient,
	itemIndex: number,
): Promise<unknown> {
	const target = targetParameter(context, itemIndex);
	const hostName = requiredString(context, itemIndex, 'hostName', 'Host name');
	const startTime = requiredString(context, itemIndex, 'startTime', 'Start time');
	const endTime = requiredString(context, itemIndex, 'endTime', 'End time');
	const body: Record<string, unknown> = {
		downtime_type: target,
		host_name: hostName,
		start_time: startTime,
		end_time: endTime,
	};
	if (target === 'service') {
		const raw = context.getNodeParameter('serviceDescriptions', itemIndex, '');
		const descriptions = (Array.isArray(raw) ? raw.map(String) : String(raw).split(','))
			.map(entry => entry.trim())
			.filter(entry => entry !== '');
		if (descriptions.length === 0) {
			throw new NodeOperationError(context.getNode(), 'Service descriptions are required');
		}
		body.service_descriptions = descriptions;
	}
	const comment = String(context.getNodeParameter('downtimeComment', itemIndex, '')).trim();
	if (comment !== '') body.comment = comment;

	await client.request({method: 'POST', path: `/domain-types/downtime/collections/${target}`, body});
	return {};
}
