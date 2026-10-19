import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CheckmkConnectorApi implements ICredentialType {
	name = 'checkmkConnectorApi';

	displayName = 'Checkmk Connector API';

	documentationUrl = 'https://docs.checkmk.com/latest/en/rest_api.html';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://monitoring.example.com',
			description:
				'Server base URL without the site path and without /check_mk. A trailing slash is ignored.',
		},
		{
			displayName: 'Site',
			name: 'site',
			type: 'string',
			default: 'cmk',
			required: true,
			description: 'Checkmk site name, as shown in the URL after the server address',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'options',
			default: '1.0',
			required: true,
			options: [
				{name: '1.0 (Checkmk 2.4 and Older)', value: '1.0'},
				{name: 'V1 (Checkmk 2.5+)', value: 'v1'},
			],
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Automation user with the permissions required by the operations you use',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {password: true},
			default: '',
			required: true,
			description: 'Automation secret of the user above',
		},
		{
			displayName: 'Allow Unauthorized Certificates',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: false,
			description:
				'Whether to skip TLS certificate validation. Only enable this for self-signed instances you trust.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.username}} {{$credentials.password}}',
				Accept: 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.host}}/{{$credentials.site}}/check_mk/api/{{$credentials.apiVersion}}',
			url: '/version',
			method: 'GET',
			skipSslCertificateValidation: '={{$credentials.allowUnauthorizedCerts}}',
		},
	};
}
