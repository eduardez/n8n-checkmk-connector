import type {IDataObject, IExecuteFunctions, IHttpRequestOptions} from 'n8n-workflow';
import {NodeOperationError} from 'n8n-workflow';

import type {CheckmkMethod} from '../catalog/types';
import {toNodeApiError} from './errors';

const CREDENTIAL_NAME = 'checkmkConnectorApi';
const MAX_PAGES = 1000;
const MAX_ITEMS = 100000;
const METHODS: Record<string, true> = {GET: true, POST: true, PUT: true, PATCH: true, DELETE: true};

export interface CheckmkCredentials {
	host: string;
	site: string;
	apiVersion: '1.0' | 'v1';
	username: string;
	password: string;
	allowUnauthorizedCerts: boolean;
}

export interface CheckmkRequestOptions {
	method: CheckmkMethod;
	path: string;
	query?: Record<string, unknown>;
	body?: unknown;
	headers?: Record<string, string>;
	ifMatch?: string;
	returnFullResponse?: boolean;
}

export interface CheckmkFullResponse {
	statusCode?: number;
	headers?: Record<string, unknown>;
	body: unknown;
}

export class CheckmkClient {
	constructor(
		private readonly context: IExecuteFunctions,
		private readonly credentials: CheckmkCredentials,
	) {}

	buildUrl(path: string): string {
		if (/^https?:\/\/[^/]/i.test(path)) return path;
		if (/^\/\//.test(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
			throw new NodeOperationError(
				this.context.getNode(),
				`Unsupported URL "${path}". Only paths or absolute http(s) URLs are allowed.`,
			);
		}

		const host = this.credentials.host.trim().replace(/\/+$/, '');
		const site = this.credentials.site.trim().replace(/^\/+|\/+$/g, '');
		const relative = path.replace(/^\/+/, '');
		return `${host}/${encodeURIComponent(site)}/check_mk/api/${this.credentials.apiVersion}/${relative}`;
	}

	async request<T>(options: CheckmkRequestOptions): Promise<T> {
		const headers: Record<string, string> = {Accept: 'application/json'};
		if (options.body !== undefined) headers['Content-Type'] = 'application/json';
		if (options.headers) Object.assign(headers, options.headers);
		if (options.ifMatch !== undefined) headers['If-Match'] = options.ifMatch;

		const requestOptions: IHttpRequestOptions = {
			method: options.method,
			url: this.buildUrl(options.path),
			qs: options.query as IDataObject,
			arrayFormat: 'repeat',
			json: true,
			returnFullResponse: true,
			skipSslCertificateValidation: this.credentials.allowUnauthorizedCerts,
			headers,
		};
		if (options.body !== undefined) requestOptions.body = options.body;

		let response: CheckmkFullResponse;
		try {
			response = (await this.context.helpers.httpRequestWithAuthentication.call(
				this.context,
				CREDENTIAL_NAME,
				requestOptions,
			)) as CheckmkFullResponse;
		} catch (error) {
			throw toNodeApiError(this.context, error);
		}

		if (options.returnFullResponse === true) {
			return {
				statusCode: response.statusCode,
				headers: response.headers,
				body: response.body,
			} as T;
		}
		return response.body as T;
	}

	async requestAll<T>(
		options: CheckmkRequestOptions,
		returnAll: boolean,
		limit: number,
	): Promise<T[]> {
		const collected: T[] = [];
		const pageSize = returnAll ? Number.POSITIVE_INFINITY : Math.max(1, limit);
		let current: CheckmkRequestOptions | undefined = {...options};
		let pages = 0;

		while (current !== undefined) {
			pages += 1;
			if (pages > MAX_PAGES) {
				throw new NodeOperationError(
					this.context.getNode(),
					`Pagination exceeded ${MAX_PAGES} pages while reading ${options.path}`,
				);
			}

			const body = await this.request<unknown>(current);
			collected.push(...extractItems<T>(body));
			if (collected.length > MAX_ITEMS) {
				throw new NodeOperationError(
					this.context.getNode(),
					`Pagination collected more than ${MAX_ITEMS} items`,
				);
			}
			if (!returnAll) break;

			const next = extractNextLink(body);
			if (next === undefined) break;
			const method: CheckmkMethod =
				next.method !== undefined && METHODS[next.method] === true
					? (next.method as CheckmkMethod)
					: current.method;
			current = {...current, path: next.href, method};
		}

		if (returnAll) return collected;
		return collected.slice(0, pageSize);
	}
}

function extractItems<T>(body: unknown): T[] {
	if (Array.isArray(body)) return body as T[];
	if (typeof body === 'object' && body !== null) {
		const value = (body as {value?: unknown}).value;
		if (Array.isArray(value)) return value as T[];
		return [body as T];
	}
	if (body === undefined || body === null) return [];
	return [body as T];
}

function extractNextLink(body: unknown): {href: string; method?: string} | undefined {
	if (typeof body !== 'object' || body === null) return undefined;
	const links = (body as {links?: unknown}).links;
	const link = Array.isArray(links)
		? links.find(
				entry =>
					typeof entry === 'object' &&
					entry !== null &&
					(entry as {rel?: unknown}).rel === 'next' &&
					typeof (entry as {href?: unknown}).href === 'string',
			)
		: typeof links === 'object' && links !== null
			? (links as {next?: unknown}).next
			: undefined;
	if (typeof link === 'string') return {href: link};
	if (typeof link !== 'object' || link === null) return undefined;
	const candidate = link as {href?: unknown; method?: unknown};
	if (typeof candidate.href !== 'string') return undefined;
	return {
		href: candidate.href,
		method: typeof candidate.method === 'string' ? candidate.method : undefined,
	};
}
