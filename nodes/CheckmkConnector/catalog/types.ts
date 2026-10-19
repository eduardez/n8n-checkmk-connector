export type CheckmkMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ParameterKind = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ApiParameter {
	name: string;
	kind: ParameterKind;
	required: boolean;
	description?: string;
	example?: unknown;
	defaultValue?: unknown;
	enumValues?: string[];
}

export interface ApiRequestBody {
	required: boolean;
	schemaRef?: string;
	example?: unknown;
}

export interface ApiOperation {
	id: string;
	resource: string;
	resourceLabel: string;
	summary: string;
	label: string;
	method: CheckmkMethod;
	path: string;
	pathParameters: ApiParameter[];
	queryParameters: ApiParameter[];
	headerParameters: ApiParameter[];
	requestBody?: ApiRequestBody;
	ifMatch: boolean;
	paginated: boolean;
	deprecated: boolean;
}

export interface ApiResource {
	value: string;
	label: string;
}
