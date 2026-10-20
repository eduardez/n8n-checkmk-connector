import type {IExecuteFunctions} from 'n8n-workflow';

import type {CheckmkClient, CheckmkCredentials} from './CheckmkClient';

const VERSION_CACHE_KEY = 'checkmkConnectorVersion';
const VERSION_CACHE_TTL_MS = 60 * 60 * 1000;

export interface CheckmkVersion {
	raw: string;
	major: number;
	minor: number;
	patch: number;
}

interface VersionResponse {
	versions?: {checkmk?: unknown};
}

interface VersionCache extends Record<string, unknown> {
	key: string;
	expiresAt: number;
	raw: string;
}

/** Parses the Checkmk version string, e.g. `2.4.0p37.cre`. */
export function parseCheckmkVersion(raw: unknown): CheckmkVersion | undefined {
	if (typeof raw !== 'string') return undefined;
	const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(raw.trim());
	if (match === null) return undefined;
	return {
		raw: raw.trim(),
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: match[3] === undefined ? 0 : Number(match[3]),
	};
}

/**
 * Returns a user-facing warning when the connected Checkmk version cannot
 * serve the generated catalog as-is. An empty result means no known mismatch.
 */
export function compatibilityWarning(
	version: CheckmkVersion,
	apiVersion: string,
): string | undefined {
	if (version.major < 2 || (version.major === 2 && version.minor < 4)) {
		return `Checkmk ${version.raw} predates 2.4. The operation catalog was generated from Checkmk 2.4 and some operations may be missing or behave differently.`;
	}
	if (version.major >= 3 && apiVersion === '1.0') {
		return `Checkmk ${version.raw} no longer serves REST API 1.0. Set "API Version" to "v1" in the Checkmk Connector credential.`;
	}
	return undefined;
}

function cacheKey(credentials: CheckmkCredentials): string {
	return `${credentials.host.replace(/\/+$/, '')}|${credentials.site.replace(/^\/+|\/+$/g, '')}`;
}

async function readVersion(
	context: IExecuteFunctions,
	client: CheckmkClient,
	credentials: CheckmkCredentials,
): Promise<CheckmkVersion | undefined> {
	let staticData: Record<string, unknown> | undefined;
	try {
		staticData = context.getWorkflowStaticData('global') as Record<string, unknown>;
	} catch {
		staticData = undefined;
	}

	const key = cacheKey(credentials);
	const cached = staticData?.[VERSION_CACHE_KEY] as VersionCache | undefined;
	if (
		cached !== undefined &&
		cached.key === key &&
		cached.expiresAt > Date.now() &&
		typeof cached.raw === 'string'
	) {
		return parseCheckmkVersion(cached.raw);
	}

	const response = await client.request<VersionResponse>({method: 'GET', path: '/version'});
	const version = parseCheckmkVersion(response?.versions?.checkmk);
	if (version !== undefined && staticData !== undefined) {
		staticData[VERSION_CACHE_KEY] = {
			key,
			expiresAt: Date.now() + VERSION_CACHE_TTL_MS,
			raw: version.raw,
		} satisfies VersionCache;
	}
	return version;
}

/**
 * Best-effort compatibility probe. Runs at most once per workflow per hour and
 * never fails the execution; it logs a warning on a known mismatch and returns
 * the detected version for callers that must adapt to older APIs.
 */
export async function probeCheckmkVersion(
	context: IExecuteFunctions,
	client: CheckmkClient,
	credentials: CheckmkCredentials,
): Promise<CheckmkVersion | undefined> {
	try {
		const version = await readVersion(context, client, credentials);
		if (version === undefined) return undefined;
		const warning = compatibilityWarning(version, credentials.apiVersion);
		if (warning !== undefined) context.logger.warn(warning);
		return version;
	} catch {
		// The probe is advisory: an unreachable /version must not break the run.
		return undefined;
	}
}
