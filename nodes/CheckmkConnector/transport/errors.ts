import type {IExecuteFunctions, JsonObject} from 'n8n-workflow';
import {NodeApiError} from 'n8n-workflow';

interface ErrorPayload {
	title?: unknown;
	detail?: unknown;
	fields?: unknown;
}

function pickBody(error: unknown): unknown {
	if (typeof error !== 'object' || error === null) return undefined;
	const candidate = error as {
		response?: {body?: unknown};
		body?: unknown;
	};
	return candidate.response?.body ?? candidate.body;
}

function pickStatusCode(error: unknown): number | undefined {
	if (typeof error !== 'object' || error === null) return undefined;
	const candidate = error as {
		statusCode?: unknown;
		httpCode?: unknown;
		response?: {statusCode?: unknown};
	};
	for (const value of [candidate.statusCode, candidate.httpCode, candidate.response?.statusCode]) {
		if (typeof value === 'number') return value;
	}
	return undefined;
}

/**
 * Converts any transport failure into a NodeApiError, lifting Checkmk's
 * problem+json title/detail/fields into the n8n error message and description.
 */
export function toNodeApiError(context: IExecuteFunctions, error: unknown): NodeApiError {
	if (error instanceof NodeApiError) return error;

	const rawBody = pickBody(error);
	const body: ErrorPayload =
		typeof rawBody === 'object' && rawBody !== null ? (rawBody as ErrorPayload) : {};

	const descriptionParts: string[] = [];
	if (typeof body.detail === 'string' && body.detail.trim() !== '') {
		descriptionParts.push(body.detail.trim());
	}
	if (body.fields !== undefined && body.fields !== null) {
		const fields = body.fields;
		const entries: string[] = [];
		if (Array.isArray(fields)) {
			for (const field of fields) {
				entries.push(describeField(field));
			}
		} else if (typeof fields === 'object') {
			for (const [name, value] of Object.entries(fields as Record<string, unknown>)) {
				entries.push(`${name}: ${describeField(value)}`);
			}
		}
		const present = entries.filter(entry => entry !== '');
		if (present.length > 0) {
			descriptionParts.push(present.join(', '));
		}
	}

	const fallbackMessage =
		typeof (error as {message?: unknown})?.message === 'string'
			? ((error as {message: string}).message as string)
			: 'Request failed';

	const message = typeof body.title === 'string' && body.title.trim() !== ''
		? body.title.trim()
		: fallbackMessage;

	const options: {message: string; description?: string; httpCode?: string} = {message};
	if (descriptionParts.length > 0) options.description = descriptionParts.join(' — ');
	const statusCode = pickStatusCode(error);
	if (statusCode !== undefined) options.httpCode = String(statusCode);

	const errorResponse: JsonObject =
		typeof rawBody === 'object' && rawBody !== null && !Array.isArray(rawBody)
			? (rawBody as JsonObject)
			: {message: fallbackMessage};

	return new NodeApiError(context.getNode(), errorResponse, options);
}

function describeField(field: unknown): string {
	if (typeof field === 'string') return field;
	if (typeof field === 'object' && field !== null) {
		const candidate = field as {field?: unknown; message?: unknown; location?: unknown};
		if (typeof candidate.field === 'string' && typeof candidate.message === 'string') {
			return `${candidate.field}: ${candidate.message}`;
		}
		if (typeof candidate.message === 'string') return candidate.message;
		return JSON.stringify(field);
	}
	return String(field);
}
