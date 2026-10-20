// Generates the Checkmk operation catalog and docs/operations.md from the
// Checkmk REST API OpenAPI document. Development command: `npm run generate`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parse } from 'yaml';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const SUPPORTED_VERSION = '1.0';
const MAX_DESCRIPTION = 240;
const IGNORED_HEADERS = new Set(['content-type', 'accept', 'authorization']);

function argValue(name) {
	const idx = process.argv.indexOf(name);
	if (idx === -1) return undefined;
	const value = process.argv[idx + 1];
	if (!value) {
		throw new Error(`Missing value for ${name}`);
	}
	return value;
}

const input =
	argValue('--input') ??
	process.env.CHECKMK_OPENAPI_URL ??
	'http://localhost:8080/cmk/check_mk/api/1.0/openapi-doc.yaml';

async function loadDocument() {
	if (/^https?:\/\//.test(input)) {
		const username = process.env.CHECKMK_USERNAME ?? 'cmkadmin';
		const password = process.env.CHECKMK_PASSWORD ?? 'mypassword';
		const response = await fetch(input, {
			headers: {
				Authorization: `Bearer ${username} ${password}`,
				Accept: 'application/yaml',
			},
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch ${input}: HTTP ${response.status}`);
		}
		return parse(await response.text());
	}
	return parse(await import('node:fs/promises').then(m => m.readFile(resolve(input), 'utf8')));
}

const words = value => value.split(/[^A-Za-z0-9]+/).filter(Boolean);

function slug(tag) {
	const parts = words(tag);
	if (parts.length === 0) {
		throw new Error(`Cannot derive a resource slug from tag "${tag}"`);
	}
	return parts
		.map((part, index) =>
			index === 0
				? part.charAt(0).toLowerCase() + part.slice(1)
				: part.charAt(0).toUpperCase() + part.slice(1),
		)
		.join('');
}

function compact(text) {
	if (typeof text !== 'string') return undefined;
	const collapsed = text.replace(/\s+/g, ' ').trim();
	if (!collapsed) return undefined;
	if (collapsed.length <= MAX_DESCRIPTION) return collapsed;
	return `${collapsed.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…`;
}

function createSchemaResolver(schemas) {
	function resolveRef(schema) {
		let current = schema;
		const seen = new Set();
		while (current && typeof current === 'object' && typeof current.$ref === 'string') {
			if (seen.has(current.$ref)) return current;
			seen.add(current.$ref);
			const prefix = '#/components/schemas/';
			if (!current.$ref.startsWith(prefix)) return current;
			const name = current.$ref.slice(prefix.length);
			if (!(name in schemas)) return current;
			current = schemas[name];
		}
		return current;
	}

	function kindOf(schema) {
		const resolved = resolveRef(schema);
		const type = resolved?.type;
		if (type === 'array') return 'array';
		if (type === 'object') return 'object';
		if (type === 'integer' || type === 'number') return 'number';
		if (type === 'boolean') return 'boolean';
		if (type === undefined && resolved?.properties) return 'object';
		return 'string';
	}

	function defaultValue(schema, { strict } = { strict: false }) {
		const resolved = resolveRef(schema);
		if (!resolved || typeof resolved !== 'object') return null;
		if (resolved.example !== undefined) return resolved.example;
		if (typeof resolved.default !== 'object' || resolved.default === null) {
			if (resolved.default !== undefined) return resolved.default;
		}
		if (Array.isArray(resolved.allOf)) {
			const merged = {};
			let hasObject = false;
			for (const part of resolved.allOf) {
				const value = defaultValue(part, { strict });
				if (value && typeof value === 'object' && !Array.isArray(value)) {
					Object.assign(merged, value);
					hasObject = true;
				}
			}
			return hasObject ? merged : null;
		}
		const variant = Array.isArray(resolved.oneOf) && resolved.oneOf.length > 0
			? resolved.oneOf[0]
			: Array.isArray(resolved.anyOf) && resolved.anyOf.length > 0
				? resolved.anyOf[0]
				: undefined;
		if (variant) return defaultValue(variant, { strict });
		const kind = kindOf(resolved);
		if (kind === 'array') {
			const items = Array.isArray(resolved.items) ? resolved.items[0] : resolved.items;
			if (items) {
				const itemValue = defaultValue(items, { strict: true });
				if (itemValue !== null && itemValue !== undefined) return [itemValue];
			}
			return [];
		}
		if (kind === 'object') {
			const example = {};
			const properties = resolved.properties ?? {};
			const required = new Set(resolved.required ?? []);
			for (const [name, property] of Object.entries(properties)) {
				const value = defaultValue(property, { strict: true });
				if (value !== null && value !== undefined) {
					example[name] = value;
				} else if (required.has(name)) {
					example[name] = typeDefault(kindOf(property));
				}
			}
			return example;
		}
		if (strict) return undefined;
		return typeDefault(kind);
	}

	return { resolveRef, kindOf, defaultValue };
}

function typeDefault(kind) {
	switch (kind) {
		case 'array':
			return [];
		case 'object':
			return {};
		case 'number':
			return 0;
		case 'boolean':
			return false;
		case 'string':
			return '';
		default:
			return null;
	}
}

function parameterExample(parameter, resolver) {
	const raw = parameter.example ?? parameter.schema?.example ?? parameter.default ?? parameter.schema?.default;
	if (raw !== undefined) return raw;
	return undefined;
}

function toParameter(parameter, resolver, kind) {
	const schema = resolver.resolveRef(parameter.schema ?? {});
	const enumValues = Array.isArray(schema.enum) ? schema.enum.map(value => String(value)) : undefined;
	const example = parameterExample(parameter, resolver);
	const result = {
		name: parameter.name,
		kind: kind ?? resolver.kindOf(parameter.schema ?? {}),
		required: Boolean(parameter.required),
	};
	const description = compact(parameter.description);
	if (description) result.description = description;
	if (example !== undefined) result.example = example;
	const declaredDefault = parameter.default ?? schema.default;
	if (declaredDefault !== undefined) result.defaultValue = declaredDefault;
	if (enumValues && enumValues.length > 0) result.enumValues = enumValues;
	return result;
}

const ACRONYM_CASING = {
	api: 'API',
	bi: 'BI',
	csrs: 'CSRs',
	http: 'HTTP',
	https: 'HTTPS',
	json: 'JSON',
	ldap: 'LDAP',
	pem: 'PEM',
	rest: 'REST',
	url: 'URL',
	uuid: 'UUID',
};
const SMALL_WORDS = new Set([
	'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from',
	'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with',
]);
const ARTICLES = new Set(['a', 'an', 'the']);
// Longest/most specific prefix first.
const VERB_PREFIXES = [
	['show all', 'Get Many'],
	['show', 'Get'],
	['get all', 'Get Many'],
	['get', 'Get'],
	['list existing', 'List'],
	['list', 'List'],
	['bulk create', 'Bulk Create'],
	['bulk update', 'Bulk Update'],
	['bulk delete', 'Bulk Delete'],
	['create/clone', 'Create'],
	['create', 'Create'],
	['delete', 'Delete'],
	['update', 'Update'],
	['edit', 'Update'],
	['modify', 'Update'],
	['move', 'Move'],
	['rename', 'Rename'],
	['link', 'Link'],
	['register', 'Register'],
	['remove', 'Remove'],
	['set', 'Set'],
	['activate', 'Activate'],
	['archive', 'Archive'],
	['change', 'Change'],
	['execute', 'Execute'],
	['start', 'Start'],
	['run', 'Run'],
	['fetch', 'Fetch'],
	['search', 'Search'],
	['call', 'Call'],
	['download', 'Download'],
	['display', 'Display'],
	['login', 'Log In'],
	['logout', 'Log Out'],
	['wait', 'Wait'],
	['save', 'Save'],
];

function titleCase(text) {
	return String(text)
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((token, index) => {
			const lower = token.toLowerCase();
			if (index > 0 && SMALL_WORDS.has(lower)) return lower;
			const key = lower.replace(/[^a-z0-9.+/#]/g, '');
			if (key !== '' && ACRONYM_CASING[key] !== undefined) {
				return lower.split(key).join(ACRONYM_CASING[key]);
			}
			// Keep words that already carry meaningful casing, e.g. "PEM-encoded".
			if (/[A-Z]/.test(token.slice(1))) return token;
			return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
		})
		.join(' ');
}

function humanizeSummary(summary) {
	const text = String(summary).trim().replace(/\.$/, '');
	const tokens = text.split(/\s+/).filter(Boolean);
	const withoutArticles = tokens.filter((word, index) => index === 0 || !ARTICLES.has(word.toLowerCase()));
	const lower = withoutArticles.join(' ').toLowerCase();
	const prefix = VERB_PREFIXES.find(([verb]) => lower === verb || lower.startsWith(`${verb} `));
	if (prefix !== undefined) {
		const [verb, replacement] = prefix;
		return titleCase(`${replacement} ${withoutArticles.join(' ').slice(verb.length).trim()}`);
	}
	return titleCase(withoutArticles.join(' '));
}

function buildOperations(document) {
	const resolver = createSchemaResolver(document.components?.schemas ?? {});
	const operations = [];
	const seenIds = new Set();

	for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
		for (const method of METHODS) {
			const raw = pathItem?.[method];
			if (!raw) continue;
			const id = raw.operationId;
			if (typeof id !== 'string' || id.length === 0) {
				throw new Error(`Operation ${method.toUpperCase()} ${path} has no operationId`);
			}
			if (seenIds.has(id)) {
				throw new Error(`Duplicate operationId "${id}"`);
			}
			seenIds.add(id);

			const tags = Array.isArray(raw.tags) ? raw.tags : [];
			const resourceLabel = titleCase(String(tags[0] ?? 'Undocumented'));
			const parameters = [...(pathItem.parameters ?? []), ...(raw.parameters ?? [])];
			const pathParameters = [];
			const queryParameters = [];
			const headerParameters = [];
			let ifMatch = false;
			for (const parameter of parameters) {
				if (parameter.in === 'path') {
					pathParameters.push(toParameter(parameter, resolver));
				} else if (parameter.in === 'query') {
					queryParameters.push(toParameter(parameter, resolver));
				} else if (parameter.in === 'header') {
					const name = String(parameter.name ?? '').toLowerCase();
					if (name === 'if-match') {
						ifMatch = true;
					} else if (!IGNORED_HEADERS.has(name)) {
						headerParameters.push(toParameter(parameter, resolver, parameter.schema?.type === 'boolean' ? 'boolean' : undefined));
					}
				}
			}

			let requestBody;
			const media = raw.requestBody?.content?.['application/json'];
			if (media) {
				const schema = media.schema;
				const schemaRef = typeof schema?.$ref === 'string' ? schema.$ref : undefined;
				const body = { required: Boolean(raw.requestBody.required) };
				if (schemaRef) body.schemaRef = schemaRef;
				const example = resolver.defaultValue(schema, { strict: false });
				body.example = example === undefined ? {} : example;
				requestBody = body;
			}

			const summary = compact(raw.summary) ?? id;
			operations.push({
				id,
				resourceLabel,
				resource: slug(resourceLabel),
				summary,
				method: method.toUpperCase(),
				path,
				pathParameters,
				queryParameters,
				headerParameters,
				requestBody,
				ifMatch,
				paginated: method === 'get' && path.includes('/collections/'),
				deprecated: Boolean(raw.deprecated),
			});
		}
	}

	const resources = new Map();
	for (const operation of operations) {
		const existing = resources.get(operation.resource);
		if (existing !== undefined && existing !== operation.resourceLabel) {
			throw new Error(
				`Resource slug collision: "${existing}" and "${operation.resourceLabel}" both map to "${operation.resource}"`,
			);
		}
		resources.set(operation.resource, operation.resourceLabel);
	}

	for (const operation of operations) {
		const baseLabel = humanizeSummary(operation.summary);
		operation.label = operation.deprecated ? `${baseLabel} (deprecated)` : baseLabel;
	}
	const labelCounts = new Map();
	for (const operation of operations) {
		const key = `${operation.resource}\u0000${operation.label}`;
		labelCounts.set(key, (labelCounts.get(key) ?? 0) + 1);
	}
	for (const operation of operations) {
		const key = `${operation.resource}\u0000${operation.label}`;
		if (labelCounts.get(key) > 1) {
			operation.label = `${operation.label} (${operation.method})`;
		}
	}

	operations.sort((a, b) => {
		const byResource = a.resourceLabel.localeCompare(b.resourceLabel);
		if (byResource !== 0) return byResource;
		const byLabel = a.label.localeCompare(b.label);
		if (byLabel !== 0) return byLabel;
		const byPath = a.path.localeCompare(b.path);
		if (byPath !== 0) return byPath;
		return a.method.localeCompare(b.method);
	});

	return {
		operations,
		resources: [...resources]
			.map(([value, label]) => ({value, label}))
			.sort((a, b) => a.label.localeCompare(b.label)),
	};
}

function serialize(value, indent = '\t') {
	return JSON.stringify(value, null, '\t').replace(/\n/g, `\n${indent}`);
}

function renderCatalog(operations, resources) {
	const opEntries = operations.map(operation => serialize(operation)).join(',\n\t');
	const resEntries = resources.map(resource => serialize(resource)).join(',\n\t');
	return `// Generated from the Checkmk REST API ${SUPPORTED_VERSION} OpenAPI document.
// Source version: ${SUPPORTED_VERSION}. Do not edit by hand.

import type {ApiOperation, ApiResource} from './types';

export const OPERATIONS: ApiOperation[] = [
\t${opEntries},
];

export const RESOURCES: ApiResource[] = [
\t${resEntries},
];
`;
}

function renderDocs(operations, resources) {
	const rows = operations
		.map(
			operation =>
				`| ${operation.resourceLabel} | ${operation.label} | ${operation.method} | \`${operation.path}\` | ${operation.deprecated ? 'deprecated' : ''} |`,
		)
		.join('\n');
	return `# Generated operations

Generated from the Checkmk REST API ${SUPPORTED_VERSION} OpenAPI document by \`npm run generate\`. Do not edit by hand.

- Operations: ${operations.length}
- Resources: ${resources.length}

| Resource | Operation | Method | Path | Notes |
| --- | --- | --- | --- | --- |
${rows}
`;
}

const document = await loadDocument();
if (document?.info?.version !== SUPPORTED_VERSION) {
	throw new Error(
		`Unsupported Checkmk OpenAPI version "${document?.info?.version}", expected "${SUPPORTED_VERSION}"`,
	);
}

const {operations, resources} = buildOperations(document);
const uniqueIds = new Set(operations.map(operation => operation.id));
if (uniqueIds.size !== operations.length) {
	throw new Error('Operation IDs are not unique');
}

const catalogPath = resolve('nodes/CheckmkConnector/catalog/operations.generated.ts');
const docsPath = resolve('docs/operations.md');
mkdirSync(dirname(catalogPath), {recursive: true});
mkdirSync(dirname(docsPath), {recursive: true});
writeFileSync(catalogPath, renderCatalog(operations, resources));
writeFileSync(docsPath, renderDocs(operations, resources));
console.log(
	`Generated ${operations.length} operations across ${resources.length} resources from ${input}`,
);
