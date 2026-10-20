// Generated from the Checkmk REST API 1.0 OpenAPI document.
// Source version: 1.0. Do not edit by hand.

import type {ApiOperation, ApiResource} from './types';

export const OPERATIONS: ApiOperation[] = [
	{
		"id": "cmk.gui.openapi.endpoints.acknowledgement.delete_acknowledgement",
		"resourceLabel": "Acknowledge Problems",
		"resource": "acknowledgeProblems",
		"summary": "Remove acknowledgement on host or service problems.",
		"method": "POST",
		"path": "/domain-types/acknowledge/actions/delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/RemoveProblemAcknowledgement",
			"example": {
				"acknowledge_type": "host",
				"host_name": "example.com"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Remove Acknowledgement"
	},
	{
		"id": "cmk.gui.openapi.endpoints.acknowledgement.set_acknowledgement_on_hosts",
		"resourceLabel": "Acknowledge Problems",
		"resource": "acknowledgeProblems",
		"summary": "Set acknowledgement on related hosts",
		"method": "POST",
		"path": "/domain-types/acknowledge/collections/host",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/AcknowledgeHostRelatedProblem",
			"example": {
				"sticky": false,
				"persistent": false,
				"notify": false,
				"comment": "This was expected.",
				"expire_on": "2025-05-20T07:30:00Z",
				"acknowledge_type": "host",
				"host_name": "example.com"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Set Acknowledgement on Related Hosts"
	},
	{
		"id": "cmk.gui.openapi.endpoints.acknowledgement.set_acknowledgement_on_services",
		"resourceLabel": "Acknowledge Problems",
		"resource": "acknowledgeProblems",
		"summary": "Set acknowledgement on related services",
		"method": "POST",
		"path": "/domain-types/acknowledge/collections/service",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/AcknowledgeServiceRelatedProblem",
			"example": {
				"sticky": false,
				"persistent": false,
				"notify": false,
				"comment": "This was expected.",
				"expire_on": "2025-05-20T07:30:00Z",
				"acknowledge_type": "service",
				"host_name": "example.com",
				"service_description": "CPU load"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Set Acknowledgement on Related Services"
	},
	{
		"id": "cmk.gui.openapi.endpoints.activate_changes.activate_changes",
		"resourceLabel": "Activate Changes",
		"resource": "activateChanges",
		"summary": "Activate pending changes",
		"method": "POST",
		"path": "/domain-types/activation_run/actions/activate-changes/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ActivateChanges",
			"example": {
				"redirect": false,
				"sites": [
					"production"
				],
				"force_foreign_changes": false
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Activate"
	},
	{
		"id": "cmk.gui.openapi.endpoints.activate_changes.show_activation",
		"resourceLabel": "Activate Changes",
		"resource": "activateChanges",
		"summary": "Show the activation status",
		"method": "GET",
		"path": "/objects/activation_run/{activation_id}",
		"pathParameters": [
			{
				"name": "activation_id",
				"kind": "string",
				"required": true,
				"description": "The activation-id.",
				"example": "d3b07384d113e0ec49eaa6238ad5ff00"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Activation Status"
	},
	{
		"id": "cmk.gui.openapi.endpoints.activate_changes.list_pending_changes",
		"resourceLabel": "Activate Changes",
		"resource": "activateChanges",
		"summary": "Show all pending changes",
		"method": "GET",
		"path": "/domain-types/activation_run/collections/pending_changes",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.activate_changes.list_activations",
		"resourceLabel": "Activate Changes",
		"resource": "activateChanges",
		"summary": "Show all currently running activations",
		"method": "GET",
		"path": "/domain-types/activation_run/collections/running",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many Currently Running Activations"
	},
	{
		"id": "cmk.gui.openapi.endpoints.activate_changes.activate_changes_wait_for_completion",
		"resourceLabel": "Activate Changes",
		"resource": "activateChanges",
		"summary": "Wait for activation completion",
		"method": "GET",
		"path": "/objects/activation_run/{activation_id}/actions/wait-for-completion/invoke",
		"pathParameters": [
			{
				"name": "activation_id",
				"kind": "string",
				"required": true,
				"description": "The activation-id.",
				"example": "d3b07384d113e0ec49eaa6238ad5ff00"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Wait for Activation Completion"
	},
	{
		"id": "cmk.gui.openapi.endpoints.agent.download_agent",
		"resourceLabel": "Agents",
		"resource": "agents",
		"summary": "Download agents shipped with Checkmk",
		"method": "GET",
		"path": "/domain-types/agent/actions/download/invoke",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "os_type",
				"kind": "string",
				"required": true,
				"description": "The type of the operating system. May be one of linux_rpm, linux_deb, windows_msi",
				"example": "linux_deb",
				"enumValues": [
					"linux_deb",
					"linux_rpm",
					"windows_msi"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Download Agents Shipped with Checkmk"
	},
	{
		"id": "cmk.gui.openapi.endpoints.audit_log.get_all",
		"resourceLabel": "Audit Logs",
		"resource": "auditLogs",
		"summary": "Get all audit log entries",
		"method": "GET",
		"path": "/domain-types/audit_log/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "object_type",
				"kind": "string",
				"required": false,
				"description": "The type of object we want to filter on",
				"example": "Folder",
				"defaultValue": "All",
				"enumValues": [
					"All",
					"None",
					"Folder",
					"Host",
					"User",
					"Rule",
					"Ruleset"
				]
			},
			{
				"name": "object_id",
				"kind": "string",
				"required": false,
				"description": "Name of an object to filter by",
				"example": "host_01"
			},
			{
				"name": "user_id",
				"kind": "string",
				"required": false,
				"description": "An username to filter by",
				"example": "my_admin_user"
			},
			{
				"name": "date",
				"kind": "string",
				"required": true,
				"description": "The date from wich to obtain the audit log entries. The format has to conform to the ISO 8601 profile",
				"example": "2017-07-21"
			},
			{
				"name": "regexp",
				"kind": "string",
				"required": false,
				"description": "A regular expression to be applied to the user_id, action and summary fields.",
				"example": "^l.*m.*p"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.audit_log.archive_logs",
		"resourceLabel": "Audit Logs",
		"resource": "auditLogs",
		"summary": "Move audit log entries to archive",
		"method": "POST",
		"path": "/domain-types/audit_log/actions/archive/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Move Audit Log Entries to Archive"
	},
	{
		"id": "cmk.gui.openapi.endpoints.autocomplete.show",
		"resourceLabel": "Autocomplete (internal)",
		"resource": "autocompleteInternal",
		"summary": "Call the autocompleter specified in the url",
		"method": "POST",
		"path": "/objects/autocomplete/{autocomplete_id}",
		"pathParameters": [
			{
				"name": "autocomplete_id",
				"kind": "string",
				"required": true,
				"description": "The id of the autocompleter",
				"example": "tag_groups"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/Request",
			"example": {
				"value": "central_site",
				"parameters": {
					"strict": false,
					"context": {}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Call Autocompleter Specified in URL"
	},
	{
		"id": "cmk.gui.openapi.endpoints.aux_tags.create_aux_tag",
		"resourceLabel": "Aux Tags",
		"resource": "auxTags",
		"summary": "Create an Auxiliary Tag",
		"method": "POST",
		"path": "/domain-types/aux_tag/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/AuxTagAttrsCreate",
			"example": {
				"aux_tag_id": "ip-v4",
				"topic": "Monitoring agents",
				"title": "AuxTagExampleTitle",
				"help": "AuxTagExampleHelp"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.aux_tags.delete_aux_tag",
		"resourceLabel": "Aux Tags",
		"resource": "auxTags",
		"summary": "Delete an Auxiliary Tag",
		"method": "POST",
		"path": "/objects/aux_tag/{aux_tag_id}/actions/delete/invoke",
		"pathParameters": [
			{
				"name": "aux_tag_id",
				"kind": "string",
				"required": true,
				"description": "An auxiliary tag id",
				"example": "ip-v4"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.aux_tags.show_aux_tag",
		"resourceLabel": "Aux Tags",
		"resource": "auxTags",
		"summary": "Show an Auxiliary Tag",
		"method": "GET",
		"path": "/objects/aux_tag/{aux_tag_id}",
		"pathParameters": [
			{
				"name": "aux_tag_id",
				"kind": "string",
				"required": true,
				"description": "An auxiliary tag id",
				"example": "ip-v4"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.aux_tags.show_aux_tags",
		"resourceLabel": "Aux Tags",
		"resource": "auxTags",
		"summary": "Show Auxiliary Tags",
		"method": "GET",
		"path": "/domain-types/aux_tag/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.aux_tags.put_aux_tag",
		"resourceLabel": "Aux Tags",
		"resource": "auxTags",
		"summary": "Update an aux tag",
		"method": "PUT",
		"path": "/objects/aux_tag/{aux_tag_id}",
		"pathParameters": [
			{
				"name": "aux_tag_id",
				"kind": "string",
				"required": true,
				"description": "An auxiliary tag id",
				"example": "ip-v4"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/AuxTagAttrsUpdate",
			"example": {
				"topic": "Monitoring agents",
				"title": "AuxTagExampleTitle",
				"help": "AuxTagExampleHelp"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.background_job.show_background_job_snapshot",
		"resourceLabel": "Background Jobs",
		"resource": "backgroundJobs",
		"summary": "Show the last status of a background job",
		"method": "GET",
		"path": "/objects/background_job/{job_id}",
		"pathParameters": [
			{
				"name": "job_id",
				"kind": "string",
				"required": true,
				"description": "The ID of the background job",
				"example": "foobar"
			}
		],
		"queryParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": false,
				"description": "The site where the background job is located. Defaults to local site",
				"example": "foobar"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Last Status"
	},
	{
		"id": "cmk.gui.openapi.endpoints.broker_connection.create_broker_connection",
		"resourceLabel": "Broker Connection",
		"resource": "brokerConnection",
		"summary": "Create a peer to peer broker connection",
		"method": "POST",
		"path": "/domain-types/broker_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BrokerConnectionRequestCreate",
			"example": {
				"connection_id": "connection_1",
				"connection_config": {
					"connecter": {
						"site_id": "remote_1"
					},
					"connectee": {
						"site_id": "remote_2"
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.broker_connection.delete_broker_connection",
		"resourceLabel": "Broker Connection",
		"resource": "brokerConnection",
		"summary": "Delete a peer to peer broker connection",
		"method": "DELETE",
		"path": "/objects/broker_connection/{connection_id}",
		"pathParameters": [
			{
				"name": "connection_id",
				"kind": "string",
				"required": true,
				"description": "An unique connection id for the broker connection",
				"example": "connection_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.broker_connection.show_broker_connection",
		"resourceLabel": "Broker Connection",
		"resource": "brokerConnection",
		"summary": "Show a peer to peer broker connection",
		"method": "GET",
		"path": "/objects/broker_connection/{connection_id}",
		"pathParameters": [
			{
				"name": "connection_id",
				"kind": "string",
				"required": true,
				"description": "An unique connection id for the broker connection",
				"example": "connection_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.broker_connection.show_broker_connections",
		"resourceLabel": "Broker Connection",
		"resource": "brokerConnection",
		"summary": "Show all peer to peer broker connections",
		"method": "GET",
		"path": "/domain-types/broker_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.broker_connection.edit_broker_connection",
		"resourceLabel": "Broker Connection",
		"resource": "brokerConnection",
		"summary": "Edit a peer to peer broker connection",
		"method": "PUT",
		"path": "/objects/broker_connection/{connection_id}",
		"pathParameters": [
			{
				"name": "connection_id",
				"kind": "string",
				"required": true,
				"description": "An unique connection id for the broker connection",
				"example": "connection_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BrokerConnectionRequestUpdate",
			"example": {
				"connection_config": {
					"connecter": {
						"site_id": "remote_1"
					},
					"connectee": {
						"site_id": "remote_2"
					}
				}
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.bi._openapi.post_bi_aggregation",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Create a BI aggregation",
		"method": "POST",
		"path": "/objects/bi_aggregation/{aggregation_id}",
		"pathParameters": [
			{
				"name": "aggregation_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation",
				"example": "aggregation1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIAggregationEndpoint",
			"example": {
				"id": "aggr1",
				"comment": "Rule comment",
				"customer": "customer1",
				"groups": {
					"names": [
						"groupA",
						"groupB"
					],
					"paths": [
						[
							"path",
							"group",
							"a"
						],
						[
							"path",
							"group",
							"b"
						]
					]
				},
				"node": {
					"search": {
						"type": "empty"
					},
					"action": {
						"type": "state_of_host",
						"host_regex": ""
					}
				},
				"aggregation_visualization": {
					"ignore_rule_styles": false,
					"layout_id": "builtin_default",
					"line_style": "round"
				},
				"computation_options": {
					"disabled": false,
					"use_hard_states": false,
					"escalate_downtimes_as_warn": false,
					"downtime_only_on_full_problem_coverage": false,
					"freeze_aggregations": false
				},
				"pack_id": "pack1"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create BI Aggregation"
	},
	{
		"id": "cmk.gui.bi._openapi.post_bi_pack",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Create a new BI pack",
		"method": "POST",
		"path": "/objects/bi_pack/{pack_id}",
		"pathParameters": [
			{
				"name": "pack_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation pack",
				"example": "pack1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIPackEndpoint",
			"example": {
				"title": "BI Title",
				"contact_groups": [
					"contact",
					"contactgroup_b"
				],
				"public": "false"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create New BI Pack"
	},
	{
		"id": "cmk.gui.bi._openapi.post_bi_rule",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Create a new BI rule",
		"method": "POST",
		"path": "/objects/bi_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the rule",
				"example": "rule1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIRuleEndpoint",
			"example": {
				"id": "rule1",
				"nodes": [],
				"params": {
					"arguments": [
						"foo",
						"bar"
					]
				},
				"node_visualization": {
					"type": "block",
					"style_config": {}
				},
				"properties": {
					"title": "",
					"comment": "",
					"docu_url": "",
					"icon": "",
					"state_messages": {}
				},
				"aggregation_function": {
					"type": "best",
					"count": 1,
					"restrict_state": 2
				},
				"computation_options": {
					"disabled": false
				},
				"pack_id": "pack1"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create New BI Rule"
	},
	{
		"id": "cmk.gui.bi._openapi.delete_bi_aggregation",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Delete a BI aggregation",
		"method": "DELETE",
		"path": "/objects/bi_aggregation/{aggregation_id}",
		"pathParameters": [
			{
				"name": "aggregation_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation",
				"example": "aggregation1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete BI Aggregation"
	},
	{
		"id": "cmk.gui.bi._openapi.delete_bi_pack",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Delete BI pack",
		"method": "DELETE",
		"path": "/objects/bi_pack/{pack_id}",
		"pathParameters": [
			{
				"name": "pack_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation pack",
				"example": "pack1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete BI Pack"
	},
	{
		"id": "cmk.gui.bi._openapi.delete_bi_rule",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Delete BI rule",
		"method": "DELETE",
		"path": "/objects/bi_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the rule",
				"example": "rule1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete BI Rule"
	},
	{
		"id": "cmk.gui.bi._openapi.get_bi_aggregation",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Get a BI aggregation",
		"method": "GET",
		"path": "/objects/bi_aggregation/{aggregation_id}",
		"pathParameters": [
			{
				"name": "aggregation_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation",
				"example": "aggregation1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get BI Aggregation"
	},
	{
		"id": "cmk.gui.bi._openapi.get_bi_pack",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Get a BI pack and its rules and aggregations",
		"method": "GET",
		"path": "/objects/bi_pack/{pack_id}",
		"pathParameters": [
			{
				"name": "pack_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation pack",
				"example": "pack1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get BI Pack and Its Rules and Aggregations"
	},
	{
		"id": "cmk.gui.bi._openapi.get_bi_rule",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Show a BI rule",
		"method": "GET",
		"path": "/objects/bi_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the rule",
				"example": "rule1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get BI Rule"
	},
	{
		"id": "cmk.gui.bi._openapi.get_bi_packs",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Show all BI packs",
		"method": "GET",
		"path": "/domain-types/bi_pack/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many BI Packs"
	},
	{
		"id": "cmk.gui.bi._openapi.bi_aggregation_state_get",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Get the state of BI aggregations",
		"method": "GET",
		"path": "/domain-types/bi_aggregation/actions/aggregation_state/invoke",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "filter_names",
				"kind": "array",
				"required": false,
				"description": "Filter by names",
				"example": [
					"Host foo"
				]
			},
			{
				"name": "filter_groups",
				"kind": "array",
				"required": false,
				"description": "Filter by group",
				"example": [
					"My Group"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get State of BI Aggregations (GET)"
	},
	{
		"id": "cmk.gui.bi._openapi.bi_aggregation_state_post",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Get the state of BI aggregations",
		"method": "POST",
		"path": "/domain-types/bi_aggregation/actions/aggregation_state/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIAggregationStateRequest",
			"example": {
				"filter_names": [
					"Host foo"
				],
				"filter_groups": [
					"My Group"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get State of BI Aggregations (POST)"
	},
	{
		"id": "cmk.gui.bi._openapi.put_bi_aggregation",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Update an existing BI aggregation",
		"method": "PUT",
		"path": "/objects/bi_aggregation/{aggregation_id}",
		"pathParameters": [
			{
				"name": "aggregation_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation",
				"example": "aggregation1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIAggregationEndpoint",
			"example": {
				"id": "aggr1",
				"comment": "Rule comment",
				"customer": "customer1",
				"groups": {
					"names": [
						"groupA",
						"groupB"
					],
					"paths": [
						[
							"path",
							"group",
							"a"
						],
						[
							"path",
							"group",
							"b"
						]
					]
				},
				"node": {
					"search": {
						"type": "empty"
					},
					"action": {
						"type": "state_of_host",
						"host_regex": ""
					}
				},
				"aggregation_visualization": {
					"ignore_rule_styles": false,
					"layout_id": "builtin_default",
					"line_style": "round"
				},
				"computation_options": {
					"disabled": false,
					"use_hard_states": false,
					"escalate_downtimes_as_warn": false,
					"downtime_only_on_full_problem_coverage": false,
					"freeze_aggregations": false
				},
				"pack_id": "pack1"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update Existing BI Aggregation"
	},
	{
		"id": "cmk.gui.bi._openapi.put_bi_pack",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Update an existing BI pack",
		"method": "PUT",
		"path": "/objects/bi_pack/{pack_id}",
		"pathParameters": [
			{
				"name": "pack_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the aggregation pack",
				"example": "pack1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIPackEndpoint",
			"example": {
				"title": "BI Title",
				"contact_groups": [
					"contact",
					"contactgroup_b"
				],
				"public": "false"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update Existing BI Pack"
	},
	{
		"id": "cmk.gui.bi._openapi.put_bi_rule",
		"resourceLabel": "Business Intelligence (BI)",
		"resource": "businessIntelligenceBI",
		"summary": "Update an existing BI rule",
		"method": "PUT",
		"path": "/objects/bi_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The unique id for the rule",
				"example": "rule1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BIRuleEndpoint",
			"example": {
				"id": "rule1",
				"nodes": [],
				"params": {
					"arguments": [
						"foo",
						"bar"
					]
				},
				"node_visualization": {
					"type": "block",
					"style_config": {}
				},
				"properties": {
					"title": "",
					"comment": "",
					"docu_url": "",
					"icon": "",
					"state_messages": {}
				},
				"aggregation_function": {
					"type": "best",
					"count": 1,
					"restrict_state": 2
				},
				"computation_options": {
					"disabled": false
				},
				"pack_id": "pack1"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update Existing BI Rule"
	},
	{
		"id": "cmk.gui.openapi.endpoints.cert.agent_controller_certificates_settings",
		"resourceLabel": "Certificates",
		"resource": "certificates",
		"summary": "Show agent controller certificate settings",
		"method": "GET",
		"path": "/agent_controller_certificates_settings",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Agent Controller Certificate Settings"
	},
	{
		"id": "cmk.gui.openapi.endpoints.cert.make_certificate",
		"resourceLabel": "Certificates",
		"resource": "certificates",
		"summary": "X.509 PEM-encoded Certificate Signing Requests (CSRs)",
		"method": "POST",
		"path": "/csr",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/X509ReqPEMUUID",
			"example": {
				"csr": "-----BEGIN CERTIFICATE REQUEST-----\n...\n-----END CERTIFICATE REQUEST-----\n"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "X.509 PEM-encoded Certificate Signing Requests (CSRs)"
	},
	{
		"id": "cmk.gui.openapi.endpoints.cert.root_cert",
		"resourceLabel": "Certificates",
		"resource": "certificates",
		"summary": "X.509 PEM-encoded root certificate",
		"method": "GET",
		"path": "/root_cert",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "X.509 PEM-encoded Root Certificate"
	},
	{
		"id": "cmk.gui.openapi.endpoints.comment.create_host_comment",
		"resourceLabel": "Comments",
		"resource": "comments",
		"summary": "Create a host comment",
		"method": "POST",
		"path": "/domain-types/comment/collections/host",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateHostRelatedComment",
			"example": {
				"comment": "Windows",
				"persistent": false,
				"comment_type": "host",
				"host_name": "example.com"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.comment.create_service_comment",
		"resourceLabel": "Comments",
		"resource": "comments",
		"summary": "Create a service comment",
		"method": "POST",
		"path": "/domain-types/comment/collections/service",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateServiceRelatedComment",
			"example": {
				"comment": "Windows",
				"persistent": false,
				"comment_type": "service",
				"host_name": "example.com",
				"service_description": "Memory"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create Service"
	},
	{
		"id": "cmk.gui.openapi.endpoints.comment.delete_comments",
		"resourceLabel": "Comments",
		"resource": "comments",
		"summary": "Delete comments",
		"method": "POST",
		"path": "/domain-types/comment/actions/delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/DeleteComments",
			"example": {
				"delete_type": "delete_by_query",
				"comment_id": 21,
				"site_id": "production"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.comment.show_comment",
		"resourceLabel": "Comments",
		"resource": "comments",
		"summary": "Show a comment",
		"method": "GET",
		"path": "/objects/comment/{comment_id}",
		"pathParameters": [
			{
				"name": "comment_id",
				"kind": "number",
				"required": true,
				"description": "An existing comment's ID",
				"example": "1"
			}
		],
		"queryParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.comment.show_comments",
		"resourceLabel": "Comments",
		"resource": "comments",
		"summary": "Show comments",
		"method": "GET",
		"path": "/domain-types/comment/collections/{collection_name}",
		"pathParameters": [
			{
				"name": "collection_name",
				"kind": "string",
				"required": true,
				"description": "Do you want to get comments from 'hosts', 'services' or 'all'",
				"example": "all",
				"enumValues": [
					"host",
					"service",
					"all"
				]
			}
		],
		"queryParameters": [
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'comments' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			},
			{
				"name": "host_name",
				"kind": "string",
				"required": false,
				"description": "The host name. No exception is raised when the specified host name does not exist",
				"example": "example.com"
			},
			{
				"name": "service_description",
				"kind": "string",
				"required": false,
				"description": "The service name. No exception is raised when the specified service description does not exist",
				"example": "Memory"
			},
			{
				"name": "site_id",
				"kind": "string",
				"required": false,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity._create_configuration_entity",
		"resourceLabel": "Configuration Entities",
		"resource": "configurationEntities",
		"summary": "Create a configuration entity",
		"method": "POST",
		"path": "/domain-types/configuration_entity/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateConfigurationEntity",
			"example": {
				"entity_type": "notification_parameter",
				"entity_type_specifier": "mail",
				"data": {}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity._get_configuration_entity_form_spec_schema",
		"resourceLabel": "Configuration Entities",
		"resource": "configurationEntities",
		"summary": "Get a configuration entity form spec schema",
		"method": "GET",
		"path": "/domain-types/form_spec/collections/{entity_type}",
		"pathParameters": [
			{
				"name": "entity_type",
				"kind": "string",
				"required": true,
				"description": "Type of configuration entity",
				"example": "notification_parameter",
				"enumValues": [
					"notification_parameter",
					"folder",
					"passwordstore_password"
				]
			}
		],
		"queryParameters": [
			{
				"name": "entity_type_specifier",
				"kind": "string",
				"required": true,
				"description": "Entity type specifier of the configuration entity",
				"example": "mail"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Configuration Entity Form Spec Schema"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity._update_configuration_entity",
		"resourceLabel": "Configuration Entities",
		"resource": "configurationEntities",
		"summary": "Update an existing configuration entity",
		"method": "PUT",
		"path": "/domain-types/configuration_entity/actions/edit-single-entity/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateConfigurationEntity",
			"example": {
				"entity_type": "notification_parameter",
				"entity_type_specifier": "mail",
				"entity_id": "b43b060b-3b8c-41cf-8405-dddc6dd02575",
				"data": {}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity.folder._list_folder",
		"resourceLabel": "Configuration Entities / Folder",
		"resource": "configurationEntitiesFolder",
		"summary": "List existing folder",
		"method": "GET",
		"path": "/domain-types/folder/collections/{entity_type_specifier}",
		"pathParameters": [
			{
				"name": "entity_type_specifier",
				"kind": "string",
				"required": true,
				"description": "Entity type specifier of the configuration entity",
				"example": "mail"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "List"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity.notification_parameter._get_notification_parameter",
		"resourceLabel": "Configuration Entities / Notification Parameter",
		"resource": "configurationEntitiesNotificationParameter",
		"summary": "Get a notification parameter",
		"method": "GET",
		"path": "/objects/notification_parameter/{entity_id}",
		"pathParameters": [
			{
				"name": "entity_id",
				"kind": "string",
				"required": true,
				"description": "Object id of the configuration entity",
				"example": "b43b060b-3b8c-41cf-8405-dddc6dd02575"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity.notification_parameter._list_notification_parameters",
		"resourceLabel": "Configuration Entities / Notification Parameter",
		"resource": "configurationEntitiesNotificationParameter",
		"summary": "List existing notification parameters",
		"method": "GET",
		"path": "/domain-types/notification_parameter/collections/{entity_type_specifier}",
		"pathParameters": [
			{
				"name": "entity_type_specifier",
				"kind": "string",
				"required": true,
				"description": "Entity type specifier of the configuration entity",
				"example": "mail"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "List"
	},
	{
		"id": "cmk.gui.openapi.endpoints.configuration_entity.passwordstore_password._list_passwordstore_passwords",
		"resourceLabel": "Configuration Entities / Passwordstore Password",
		"resource": "configurationEntitiesPasswordstorePassword",
		"summary": "List existing passwordstore passwords",
		"method": "GET",
		"path": "/domain-types/passwordstore_password/collections/{entity_type_specifier}",
		"pathParameters": [
			{
				"name": "entity_type_specifier",
				"kind": "string",
				"required": true,
				"description": "Entity type specifier of the configuration entity",
				"example": "mail"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "List"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.bulk_create",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Bulk create contact groups",
		"method": "POST",
		"path": "/domain-types/contact_group_config/actions/bulk-create/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkInputContactGroup",
			"example": {
				"entries": [
					{
						"name": "OnCall",
						"alias": "Not on Sundays"
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.bulk_delete",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Bulk delete contact groups",
		"method": "POST",
		"path": "/domain-types/contact_group_config/actions/bulk-delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkDeleteContactGroup",
			"example": {
				"entries": [
					"windows",
					"panels"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.bulk_update",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Bulk update contact groups",
		"method": "PUT",
		"path": "/domain-types/contact_group_config/actions/bulk-update/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkUpdateContactGroup",
			"example": {
				"entries": [
					{
						"name": "OnCall",
						"attributes": {
							"alias": "Not on Sundays"
						}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.create",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Create a contact group",
		"method": "POST",
		"path": "/domain-types/contact_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputContactGroup",
			"example": {
				"name": "OnCall",
				"alias": "Not on Sundays.",
				"inventory_paths": {
					"type": "allow_all"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.delete",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Delete a contact group",
		"method": "DELETE",
		"path": "/objects/contact_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.show",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Show a contact group",
		"method": "GET",
		"path": "/objects/contact_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.list_group",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Show all contact groups",
		"method": "GET",
		"path": "/domain-types/contact_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.contact_group_config.update",
		"resourceLabel": "Contact Groups",
		"resource": "contactGroups",
		"summary": "Update a contact group",
		"method": "PUT",
		"path": "/objects/contact_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateContactGroupAttributes",
			"example": {
				"alias": "Example Group",
				"inventory_paths": {
					"type": "allow_all"
				}
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.create_host_related_downtime",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Create a host related scheduled downtime",
		"method": "POST",
		"path": "/domain-types/downtime/collections/host",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateHostRelatedDowntime",
			"example": {
				"start_time": "2017-07-21T17:32:28Z",
				"end_time": "2017-07-21T17:32:28Z",
				"recur": "hour",
				"duration": 60,
				"comment": "Security updates",
				"downtime_type": "host",
				"host_name": "example.com"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.create_service_related_downtime",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Create a service related scheduled downtime",
		"method": "POST",
		"path": "/domain-types/downtime/collections/service",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateServiceRelatedDowntime",
			"example": {
				"start_time": "2017-07-21T17:32:28Z",
				"end_time": "2017-07-21T17:32:28Z",
				"recur": "hour",
				"duration": 60,
				"comment": "Security updates",
				"downtime_type": "service",
				"host_name": "example.com",
				"service_descriptions": [
					"CPU utilization",
					"Memory"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create Service"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.delete_downtime",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Delete a scheduled downtime",
		"method": "POST",
		"path": "/domain-types/downtime/actions/delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/DeleteDowntime",
			"example": {
				"delete_type": "params",
				"site_id": "mysite",
				"downtime_id": "54"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.show_downtime",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Show downtime",
		"method": "GET",
		"path": "/objects/downtime/{downtime_id}",
		"pathParameters": [
			{
				"name": "downtime_id",
				"kind": "string",
				"required": true,
				"description": "The id of the downtime",
				"example": "54"
			}
		],
		"queryParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.show_downtimes",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Show all scheduled downtimes",
		"method": "GET",
		"path": "/domain-types/downtime/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'downtimes' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			},
			{
				"name": "service_description",
				"kind": "string",
				"required": false,
				"description": "The service name. Matches service descriptions that contain the given value. No exception is raised when the specified service description does not exist. This parameter can be combined with the host_name parameter to filter for service do…",
				"example": "Memory"
			},
			{
				"name": "host_name",
				"kind": "string",
				"required": false,
				"description": "The host name. No exception is raised when the specified host name does not exist. Unless otherwise restricted, the results will contain both host and service downtimes for the given host.",
				"example": "example.com"
			},
			{
				"name": "downtime_type",
				"kind": "string",
				"required": false,
				"description": "The type of the downtimes to be listed.",
				"example": "host",
				"defaultValue": "both",
				"enumValues": [
					"host",
					"service",
					"both"
				]
			},
			{
				"name": "site_id",
				"kind": "string",
				"required": false,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.downtime.modify_host_downtime",
		"resourceLabel": "Downtimes",
		"resource": "downtimes",
		"summary": "Modify a scheduled downtime",
		"method": "PUT",
		"path": "/domain-types/downtime/actions/modify/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ModifyDowntime",
			"example": {
				"modify_type": "params",
				"end_time": {
					"modify_type": "absolute",
					"value": "2024-03-06T12:00:00Z"
				},
				"comment": "Security updates",
				"site_id": "mysite",
				"downtime_id": "54"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.archive_events_with_filter",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Archive events",
		"method": "POST",
		"path": "/domain-types/event_console/actions/delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/DeleteECEvents",
			"example": {
				"filter_type": "by_id",
				"site_id": "mysite",
				"event_id": 1
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Archive"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.change_event_state",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Change event state",
		"method": "POST",
		"path": "/objects/event_console/{event_id}/actions/change_state/invoke",
		"pathParameters": [
			{
				"name": "event_id",
				"kind": "string",
				"required": true,
				"description": "The event console event ID.",
				"example": "1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ChangeEventState",
			"example": {
				"site_id": "mysite",
				"new_state": "ok"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Change Event State"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.change_multiple_event_states",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Change multiple event states",
		"method": "POST",
		"path": "/domain-types/event_console/actions/change_state/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ChangeEventStateSelector",
			"example": {
				"filter_type": "params",
				"site_id": "mysite",
				"new_state": "ok",
				"query": "{\"op\": \"=\", \"left\": \"eventconsoleevents.event_host\", \"right\": \"test_host\"}"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Change Multiple Event States"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.show_event",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Show an event",
		"method": "GET",
		"path": "/objects/event_console/{event_id}",
		"pathParameters": [
			{
				"name": "event_id",
				"kind": "string",
				"required": true,
				"description": "The event console event ID.",
				"example": "1"
			}
		],
		"queryParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.show_events",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Show events",
		"method": "GET",
		"path": "/domain-types/event_console/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'eventconsoleevents' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			},
			{
				"name": "host",
				"kind": "string",
				"required": false,
				"description": "The host name. No exception is raised when the specified host name does not exist",
				"example": "host_1"
			},
			{
				"name": "application",
				"kind": "string",
				"required": false,
				"description": "Show events that originated from this app.",
				"example": "app_1"
			},
			{
				"name": "state",
				"kind": "string",
				"required": false,
				"description": "The state",
				"example": "ok",
				"enumValues": [
					"ok",
					"warning",
					"critical",
					"unknown"
				]
			},
			{
				"name": "phase",
				"kind": "string",
				"required": false,
				"description": "The event phase, open or ack",
				"example": "open",
				"enumValues": [
					"open",
					"ack"
				]
			},
			{
				"name": "site_id",
				"kind": "string",
				"required": false,
				"description": "An existing site id",
				"example": "mysite"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.update_and_acknowledge_event",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Update and acknowledge an event",
		"method": "POST",
		"path": "/objects/event_console/{event_id}/actions/update_and_acknowledge/invoke",
		"pathParameters": [
			{
				"name": "event_id",
				"kind": "string",
				"required": true,
				"description": "The event console event ID.",
				"example": "1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateAndAcknowledeEventSiteIDRequired",
			"example": {
				"phase": "ack",
				"change_comment": "Comment now acked",
				"change_contact": "Mr Monitor",
				"site_id": "mysite"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update and Acknowledge Event"
	},
	{
		"id": "cmk.gui.mkeventd._openapi.update_and_acknowledge_multiple_events",
		"resourceLabel": "Event Console",
		"resource": "eventConsole",
		"summary": "Update and acknowledge events",
		"method": "POST",
		"path": "/domain-types/event_console/actions/update_and_acknowledge/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateAndAcknowledgeSelector",
			"example": {
				"phase": "ack",
				"change_comment": "Comment now acked",
				"change_contact": "Mr Monitor",
				"filter_type": "all",
				"site_id": "mysite",
				"query": "{\"op\": \"=\", \"left\": \"eventconsoleevents.event_host\", \"right\": \"test_host\"}"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update and Acknowledge Events"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.bulk_update",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Bulk update folders",
		"method": "PUT",
		"path": "/domain-types/folder_config/actions/bulk-update/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkUpdateFolder",
			"example": {
				"entries": [
					{
						"remove_attributes": [
							"tag_foobar"
						]
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.create",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Create a folder",
		"method": "POST",
		"path": "/domain-types/folder_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateFolder",
			"example": {
				"name": "production",
				"title": "Production Hosts",
				"parent": "/",
				"attributes": {
					"tag_criticality": "prod"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.delete",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Delete a folder",
		"method": "DELETE",
		"path": "/objects/folder_config/{folder}",
		"pathParameters": [
			{
				"name": "folder",
				"kind": "string",
				"required": true,
				"description": "The path of the folder being requested. Please be aware that slashes can't be used in the URL. Also, escaping the slashes via %2f will not work. Please replace the path delimiters with the tilde character `~`. Path delimiters can be either…",
				"example": "~my~fine~folder"
			}
		],
		"queryParameters": [
			{
				"name": "delete_mode",
				"kind": "string",
				"required": false,
				"description": "Delete policy: 'recursive': Deletes the folder and all the elements it contains. 'abort_on_nonempty': Deletes the folder only if it is not empty.",
				"example": "abort_on_nonempty",
				"defaultValue": "recursive",
				"enumValues": [
					"recursive",
					"abort_on_nonempty"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.show_folder",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Show a folder",
		"method": "GET",
		"path": "/objects/folder_config/{folder}",
		"pathParameters": [
			{
				"name": "folder",
				"kind": "string",
				"required": true,
				"description": "The path of the folder being requested. Please be aware that slashes can't be used in the URL. Also, escaping the slashes via %2f will not work. Please replace the path delimiters with the tilde character `~`. Path delimiters can be either…",
				"example": "~my~fine~folder"
			}
		],
		"queryParameters": [
			{
				"name": "show_hosts",
				"kind": "boolean",
				"required": false,
				"description": "When set, all hosts that are stored in this folder will also be shown. On large setups this may come at a performance cost, so by default this is switched off.",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.list_folders",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Show all folders",
		"method": "GET",
		"path": "/domain-types/folder_config/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "parent",
				"kind": "string",
				"required": false,
				"description": "Show all sub-folders of this folder. The default is the root-folder. Path delimiters can be either `~`, `/` or `\\`. Please use the one most appropriate for your quoting/escaping needs. A good default choice is `~`.",
				"example": "/servers"
			},
			{
				"name": "recursive",
				"kind": "boolean",
				"required": false,
				"description": "List the folder (default: root) and all its sub-folders recursively.",
				"example": false,
				"defaultValue": false
			},
			{
				"name": "show_hosts",
				"kind": "boolean",
				"required": false,
				"description": "When set, all hosts that are stored in each folder will also be shown. On large setups this may come at a performance cost, so by default this is switched off.",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.hosts_of_folder",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Show all hosts in a folder",
		"method": "GET",
		"path": "/objects/folder_config/{folder}/collections/hosts",
		"pathParameters": [
			{
				"name": "folder",
				"kind": "string",
				"required": true,
				"description": "The path of the folder being requested. Please be aware that slashes can't be used in the URL. Also, escaping the slashes via %2f will not work. Please replace the path delimiters with the tilde character `~`. Path delimiters can be either…",
				"example": "~my~fine~folder"
			}
		],
		"queryParameters": [
			{
				"name": "effective_attributes",
				"kind": "boolean",
				"required": false,
				"description": "Show all effective attributes on hosts, not just the attributes which were set on this host specifically. This includes all attributes of all of this host's parent folders.",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many Hosts"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.move",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Move a folder",
		"method": "POST",
		"path": "/objects/folder_config/{folder}/actions/move/invoke",
		"pathParameters": [
			{
				"name": "folder",
				"kind": "string",
				"required": true,
				"description": "The path of the folder being requested. Please be aware that slashes can't be used in the URL. Also, escaping the slashes via %2f will not work. Please replace the path delimiters with the tilde character `~`. Path delimiters can be either…",
				"example": "~my~fine~folder"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/MoveFolder",
			"example": {
				"destination": "~my~fine/folder"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Move"
	},
	{
		"id": "cmk.gui.openapi.endpoints.folder_config.update",
		"resourceLabel": "Folders",
		"resource": "folders",
		"summary": "Update a folder",
		"method": "PUT",
		"path": "/objects/folder_config/{folder}",
		"pathParameters": [
			{
				"name": "folder",
				"kind": "string",
				"required": true,
				"description": "The path of the folder being requested. Please be aware that slashes can't be used in the URL. Also, escaping the slashes via %2f will not work. Please replace the path delimiters with the tilde character `~`. Path delimiters can be either…",
				"example": "~my~fine~folder"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateFolder",
			"example": {
				"title": "Virtual Servers.",
				"attributes": {
					"tag_networking": "wan"
				},
				"update_attributes": {
					"tag_criticality": "prod"
				},
				"remove_attributes": [
					"tag_foobar"
				]
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.bulk_create",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Bulk create host groups",
		"method": "POST",
		"path": "/domain-types/host_group_config/actions/bulk-create/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkInputHostGroup",
			"example": {
				"entries": [
					{
						"name": "windows",
						"alias": "Windows Servers"
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.bulk_delete",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Bulk delete host groups",
		"method": "POST",
		"path": "/domain-types/host_group_config/actions/bulk-delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkDeleteHostGroup",
			"example": {
				"entries": [
					"windows",
					"panels"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.bulk_update",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Bulk update host groups",
		"method": "PUT",
		"path": "/domain-types/host_group_config/actions/bulk-update/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkUpdateHostGroup",
			"example": {
				"entries": [
					{
						"name": "windows",
						"attributes": {
							"alias": "Windows Servers"
						}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.create",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Create a host group",
		"method": "POST",
		"path": "/domain-types/host_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputHostGroup",
			"example": {
				"name": "windows",
				"alias": "Windows Servers"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.delete",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Delete a host group",
		"method": "DELETE",
		"path": "/objects/host_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.get",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Show a host group",
		"method": "GET",
		"path": "/objects/host_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.list_groups",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Show all host groups",
		"method": "GET",
		"path": "/domain-types/host_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_group_config.update",
		"resourceLabel": "Host Groups",
		"resource": "hostGroups",
		"summary": "Update a host group",
		"method": "PUT",
		"path": "/objects/host_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateHostGroupAttributes",
			"example": {
				"alias": "Example Group"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host.show_host",
		"resourceLabel": "Host Status",
		"resource": "hostStatus",
		"summary": "Show host",
		"method": "GET",
		"path": "/objects/host/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "The host name",
				"example": "example.com"
			}
		],
		"queryParameters": [
			{
				"name": "columns",
				"kind": "array",
				"required": false,
				"description": "The desired columns of the `hosts` table. If left empty, a default set of columns is used.",
				"example": [
					"name"
				],
				"defaultValue": [
					"name"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host.list_hosts",
		"resourceLabel": "Host Status",
		"resource": "hostStatus",
		"summary": "Show hosts of specific condition",
		"method": "POST",
		"path": "/domain-types/host/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/HostParameters",
			"example": {
				"sites": [
					"mysite"
				],
				"query": "{\"op\": \"and\", \"expr\": [{\"op\": \"=\", \"left\": \"name\", \"right\": \"example.com\"}, {\"op\": \"!=\", \"left\": \"state\", \"right\": \"0\"}]}",
				"columns": [
					"name"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Hosts of Specific Condition"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host.list_hosts_deprecated-17003",
		"resourceLabel": "Host Status",
		"resource": "hostStatus",
		"summary": "Show hosts of specific condition",
		"method": "GET",
		"path": "/domain-types/host/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "sites",
				"kind": "array",
				"required": false,
				"description": "Restrict the query to this particular site.",
				"example": [
					"mysite"
				],
				"defaultValue": []
			},
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'hosts' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			},
			{
				"name": "columns",
				"kind": "array",
				"required": false,
				"description": "The desired columns of the `hosts` table. If left empty, a default set of columns is used.",
				"example": [
					"name"
				],
				"defaultValue": [
					"name"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": true,
		"label": "Get Hosts of Specific Condition (deprecated)"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_tag_group.create_host_tag_group",
		"resourceLabel": "Host Tag Groups",
		"resource": "hostTagGroups",
		"summary": "Create a host tag group",
		"method": "POST",
		"path": "/domain-types/host_tag_group/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputHostTagGroup",
			"example": {
				"id": "group_id",
				"title": "Kubernetes",
				"topic": "Data Sources",
				"help": "Kubernetes Pods",
				"tags": [
					{
						"id": "pod",
						"title": "Pod"
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_tag_group.delete_host_tag_group",
		"resourceLabel": "Host Tag Groups",
		"resource": "hostTagGroups",
		"summary": "Delete a host tag group",
		"method": "DELETE",
		"path": "/objects/host_tag_group/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The name of the host tag group",
				"example": "datasource"
			}
		],
		"queryParameters": [
			{
				"name": "repair",
				"kind": "boolean",
				"required": false,
				"description": "The host tag group can still be in use. Setting repair to True gives permission to automatically remove the tag from the affected hosts.",
				"example": false,
				"defaultValue": false
			},
			{
				"name": "mode",
				"kind": "string",
				"required": false,
				"description": "The host tag group can still be in use. Set mode to determine what should happen. Either 'abort' the deletion, 'delete' affected rules or 'remove' the tag from affected rules.",
				"example": "delete",
				"defaultValue": null,
				"enumValues": [
					"abort",
					"delete",
					"remove",
					"null"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_tag_group.show_host_tag_group",
		"resourceLabel": "Host Tag Groups",
		"resource": "hostTagGroups",
		"summary": "Show a host tag group",
		"method": "GET",
		"path": "/objects/host_tag_group/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The name of the host tag group",
				"example": "datasource"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_tag_group.list_host_tag_groups",
		"resourceLabel": "Host Tag Groups",
		"resource": "hostTagGroups",
		"summary": "Show all host tag groups",
		"method": "GET",
		"path": "/domain-types/host_tag_group/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_tag_group.update_host_tag_group",
		"resourceLabel": "Host Tag Groups",
		"resource": "hostTagGroups",
		"summary": "Update a host tag group",
		"method": "PUT",
		"path": "/objects/host_tag_group/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The name of the host tag group",
				"example": "datasource"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateHostTagGroup",
			"example": {
				"title": "Kubernetes",
				"topic": "Data Sources",
				"help": "Kubernetes Pods",
				"tags": [
					{
						"id": "pod",
						"title": "Pod"
					}
				],
				"repair": false
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.bulk_create_hosts",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Bulk create hosts",
		"method": "POST",
		"path": "/domain-types/host_config/actions/bulk-create/invoke",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "bake_agent",
				"kind": "boolean",
				"required": false,
				"description": "Tries to bake the agents for the just created hosts. This process is started in the background after configuring the host. Please note that the backing may take some time and might block subsequent API calls. This only works when using the…",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkCreateHost",
			"example": {
				"entries": [
					{
						"host_name": "example.com",
						"folder": "/",
						"attributes": {}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.bulk_delete",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Bulk delete hosts",
		"method": "POST",
		"path": "/domain-types/host_config/actions/bulk-delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkDeleteHost",
			"example": {
				"entries": [
					"example",
					"sample"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.bulk_update_hosts",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Bulk update hosts",
		"method": "PUT",
		"path": "/domain-types/host_config/actions/bulk-update/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkUpdateHost",
			"example": {
				"entries": [
					{
						"host_name": "example.com",
						"attributes": {}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.create_host",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Create a host",
		"method": "POST",
		"path": "/domain-types/host_config/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "bake_agent",
				"kind": "boolean",
				"required": false,
				"description": "Tries to bake the agents for the just created hosts. This process is started in the background after configuring the host. Please note that the backing may take some time and might block subsequent API calls. This only works when using the…",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateHost",
			"example": {
				"host_name": "example.com",
				"folder": "/",
				"attributes": {
					"ipaddress": "192.168.0.123"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.create_cluster_host",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Create a cluster host",
		"method": "POST",
		"path": "/domain-types/host_config/collections/clusters",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "bake_agent",
				"kind": "boolean",
				"required": false,
				"description": "Tries to bake the agents for the just created hosts. This process is started in the background after configuring the host. Please note that the backing may take some time and might block subsequent API calls. This only works when using the…",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateClusterHost",
			"example": {
				"host_name": "example.com",
				"folder": "/",
				"attributes": {
					"ipaddress": "192.168.0.123"
				},
				"nodes": [
					"host1",
					"host2",
					"host3"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create Cluster"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.delete",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Delete a host",
		"method": "DELETE",
		"path": "/objects/host_config/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.show_host",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Show a host",
		"method": "GET",
		"path": "/objects/host_config/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [
			{
				"name": "effective_attributes",
				"kind": "boolean",
				"required": false,
				"description": "Show all effective attributes on hosts, not just the attributes which were set on this host specifically. This includes all attributes of all of this host's parent folders.",
				"example": false,
				"defaultValue": false
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.list_hosts",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Show all hosts",
		"method": "GET",
		"path": "/domain-types/host_config/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "effective_attributes",
				"kind": "boolean",
				"required": false,
				"description": "Show all effective attributes on hosts, not just the attributes which were set on this host specifically. This includes all attributes of all of this host's parent folders.",
				"example": false,
				"defaultValue": false
			},
			{
				"name": "include_links",
				"kind": "boolean",
				"required": false,
				"description": "Flag which toggles whether the links field of the individual hosts should be populated.",
				"example": false,
				"defaultValue": false
			},
			{
				"name": "fields",
				"kind": "string",
				"required": false,
				"description": "The fields to include/exclude. The syntax is a comma-separated list of field paths. Each field path is a sequence of field names separated by a tilde (`~`). Field names may contain alphanumeric characters, dashes (`-`) and underscores (`_`…",
				"example": "!(links)"
			},
			{
				"name": "hostnames",
				"kind": "array",
				"required": false,
				"description": "Filter the result by a list of host names.",
				"example": [
					"host1",
					"host2"
				]
			},
			{
				"name": "site",
				"kind": "string",
				"required": false,
				"description": "Filter the result by a specific site.",
				"example": "site1"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.move",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Move a host to another folder",
		"method": "POST",
		"path": "/objects/host_config/{host_name}/actions/move/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/MoveHost",
			"example": {
				"target_folder": "~my~fine~folder"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Move Host to Another Folder"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.rename_host",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Rename a host",
		"method": "PUT",
		"path": "/objects/host_config/{host_name}/actions/rename/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/RenameHost",
			"example": {
				"new_name": "newhost"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Rename"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.update_host",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Update a host",
		"method": "PUT",
		"path": "/objects/host_config/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateHost",
			"example": {
				"attributes": {
					"ipaddress": "192.168.0.123"
				},
				"update_attributes": {
					"ipaddress": "192.168.0.123"
				},
				"remove_attributes": [
					"tag_foobar"
				]
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.update_nodes",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Update the nodes of a cluster host",
		"method": "PUT",
		"path": "/objects/host_config/{host_name}/properties/nodes",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A cluster host.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateNodes",
			"example": {
				"nodes": [
					"host1",
					"host2",
					"host3"
				]
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update Nodes of Cluster"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_config.renaming_job_wait_for_completion",
		"resourceLabel": "Hosts",
		"resource": "hosts",
		"summary": "Wait for renaming process completion",
		"method": "GET",
		"path": "/domain-types/host_config/actions/wait-for-completion/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Wait for Renaming Process Completion"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_internal.show_host",
		"resourceLabel": "Hosts (internal)",
		"resource": "hostsInternal",
		"summary": "Show a host",
		"method": "GET",
		"path": "/objects/host_config_internal/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_internal.link_with_uuid",
		"resourceLabel": "Hosts (internal)",
		"resource": "hostsInternal",
		"summary": "Link a host to a UUID",
		"method": "PUT",
		"path": "/objects/host_config_internal/{host_name}/actions/link_uuid/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/LinkHostUUID",
			"example": {
				"uuid": "34e4c967-1591-4883-8cdf-0e335b09618d"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Link Host to UUID"
	},
	{
		"id": "cmk.gui.openapi.endpoints.host_internal.register_host",
		"resourceLabel": "Hosts (internal)",
		"resource": "hostsInternal",
		"summary": "Register an existing host, ie. link it to a UUID",
		"method": "PUT",
		"path": "/objects/host_config_internal/{host_name}/actions/register/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/RegisterHost",
			"example": {
				"uuid": "34e4c967-1591-4883-8cdf-0e335b09618d"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Register Existing Host, Ie. Link It to UUID"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ldap_connection.create_ldap_connection",
		"resourceLabel": "LDAP Connections",
		"resource": "lDAPConnections",
		"summary": "Create an LDAP connection",
		"method": "POST",
		"path": "/domain-types/ldap_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/LDAPConnectionConfigCreateRequest",
			"example": {
				"users": {
					"user_base_dn": "ou=OrgUnit,dc=domaincomp,dc=de",
					"search_scope": "search_only_base_dn_entry",
					"search_filter": {
						"state": "enabled",
						"filter": "(&(objectclass=user)(objectcategory=person))"
					},
					"filter_group": {
						"state": "enabled",
						"filter": "filtergroupexample"
					},
					"user_id_attribute": {
						"state": "enabled",
						"attribute": "userattributeexample"
					},
					"user_id_case": "convert_to_lowercase",
					"umlauts_in_user_ids": "keep_umlauts",
					"create_users": "on_login"
				},
				"groups": {
					"group_base_dn": "ou=OrgUnit,dc=domaincomp,dc=de",
					"search_scope": "search_whole_subtree",
					"search_filter": {
						"state": "enabled",
						"filter": "(objectclass=group)"
					},
					"member_attribute": {
						"state": "enabled",
						"attribute": "member"
					}
				},
				"sync_plugins": {},
				"other": {
					"sync_interval": {
						"days": 0,
						"hours": 0,
						"minutes": 30
					}
				},
				"general_properties": {
					"id": "ldap_1",
					"description": "1st ldap connection",
					"comment": "test_comment",
					"documentation_url": "https://checkmk.com/doc/ldap_connections",
					"rule_activation": "activated"
				},
				"ldap_connection": {
					"directory_type": {
						"type": "active_directory_manual",
						"ldap_server": "123.31.12.34"
					},
					"bind_credentials": {
						"state": "enabled",
						"type": "explicit",
						"bind_dn": "cn=commonname,ou=OrgUnit,dc=domaincomp,dc=de",
						"explicit_password": "yourpass"
					},
					"tcp_port": {
						"state": "enabled",
						"port": 389
					},
					"ssl_encryption": "enable_ssl",
					"connect_timeout": {
						"state": "enabled",
						"seconds": 5
					},
					"ldap_version": {
						"state": "enabled",
						"version": 3
					},
					"page_size": {
						"state": "enabled",
						"size": 1000
					},
					"response_timeout": {
						"state": "enabled",
						"seconds": 60
					},
					"connection_suffix": {
						"state": "enabled",
						"suffix": "dc=domaincomp,dc=de"
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ldap_connection.delete_ldap_connection",
		"resourceLabel": "LDAP Connections",
		"resource": "lDAPConnections",
		"summary": "Delete an LDAP connection",
		"method": "DELETE",
		"path": "/objects/ldap_connection/{ldap_connection_id}",
		"pathParameters": [
			{
				"name": "ldap_connection_id",
				"kind": "string",
				"required": true,
				"description": "An LDAP connection ID string.",
				"example": "LDAP_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ldap_connection.show_ldap_connection",
		"resourceLabel": "LDAP Connections",
		"resource": "lDAPConnections",
		"summary": "Show an LDAP connection",
		"method": "GET",
		"path": "/objects/ldap_connection/{ldap_connection_id}",
		"pathParameters": [
			{
				"name": "ldap_connection_id",
				"kind": "string",
				"required": true,
				"description": "An LDAP connection ID string.",
				"example": "LDAP_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ldap_connection.show_ldap_connections",
		"resourceLabel": "LDAP Connections",
		"resource": "lDAPConnections",
		"summary": "Show all LDAP connections",
		"method": "GET",
		"path": "/domain-types/ldap_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ldap_connection.edit_ldap_connection",
		"resourceLabel": "LDAP Connections",
		"resource": "lDAPConnections",
		"summary": "Update an ldap connection",
		"method": "PUT",
		"path": "/objects/ldap_connection/{ldap_connection_id}",
		"pathParameters": [
			{
				"name": "ldap_connection_id",
				"kind": "string",
				"required": true,
				"description": "An LDAP connection ID string.",
				"example": "LDAP_1"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/LDAPConnectionConfigUpdateRequest",
			"example": {
				"users": {
					"user_base_dn": "ou=OrgUnit,dc=domaincomp,dc=de",
					"search_scope": "search_only_base_dn_entry",
					"search_filter": {
						"state": "enabled",
						"filter": "(&(objectclass=user)(objectcategory=person))"
					},
					"filter_group": {
						"state": "enabled",
						"filter": "filtergroupexample"
					},
					"user_id_attribute": {
						"state": "enabled",
						"attribute": "userattributeexample"
					},
					"user_id_case": "convert_to_lowercase",
					"umlauts_in_user_ids": "keep_umlauts",
					"create_users": "on_login"
				},
				"groups": {
					"group_base_dn": "ou=OrgUnit,dc=domaincomp,dc=de",
					"search_scope": "search_whole_subtree",
					"search_filter": {
						"state": "enabled",
						"filter": "(objectclass=group)"
					},
					"member_attribute": {
						"state": "enabled",
						"attribute": "member"
					}
				},
				"sync_plugins": {},
				"other": {
					"sync_interval": {
						"days": 0,
						"hours": 0,
						"minutes": 30
					}
				},
				"general_properties": {
					"id": "ldap_1",
					"description": "1st ldap connection",
					"comment": "test_comment",
					"documentation_url": "https://checkmk.com/doc/ldap_connections",
					"rule_activation": "activated"
				},
				"ldap_connection": {
					"directory_type": {
						"type": "active_directory_manual",
						"ldap_server": "123.31.12.34"
					},
					"bind_credentials": {
						"state": "enabled",
						"type": "explicit",
						"bind_dn": "cn=commonname,ou=OrgUnit,dc=domaincomp,dc=de",
						"explicit_password": "yourpass"
					},
					"tcp_port": {
						"state": "enabled",
						"port": 389
					},
					"ssl_encryption": "enable_ssl",
					"connect_timeout": {
						"state": "enabled",
						"seconds": 5
					},
					"ldap_version": {
						"state": "enabled",
						"version": 3
					},
					"page_size": {
						"state": "enabled",
						"size": 1000
					},
					"response_timeout": {
						"state": "enabled",
						"seconds": 60
					},
					"connection_suffix": {
						"state": "enabled",
						"suffix": "dc=domaincomp,dc=de"
					}
				}
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.metric.get_graph",
		"resourceLabel": "Metrics",
		"resource": "metrics",
		"summary": "Get metrics",
		"method": "POST",
		"path": "/domain-types/metric/actions/get/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/Get",
			"example": {
				"time_range": {
					"start": "2026-10-19 14:38:17.726272",
					"end": "2026-10-19 14:53:17.726276"
				},
				"reduce": "max",
				"site": "mysite",
				"host_name": "my.cool.host",
				"service_description": "Check_MK",
				"type": "single_metric",
				"graph_id": "cmk_cpu_time_by_phase"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.version.search",
		"resourceLabel": "Miscellaneous",
		"resource": "miscellaneous",
		"summary": "Display some version information",
		"method": "GET",
		"path": "/version",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Display Some Version Information"
	},
	{
		"id": "cmk.gui.openapi.endpoints.notification_rules.post_rule",
		"resourceLabel": "Notification Rules",
		"resource": "notificationRules",
		"summary": "Create a notification rule",
		"method": "POST",
		"path": "/domain-types/notification_rule/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/NotificationRuleRequest",
			"example": {
				"rule_config": {
					"rule_properties": {
						"description": "A description or title of this rule.",
						"comment": "A example comment.",
						"documentation_url": "http://link/to/documentation",
						"do_not_apply_this_rule": {
							"state": "disabled"
						},
						"allow_users_to_deactivate": {
							"state": "enabled"
						}
					},
					"notification_method": {
						"notify_plugin": {
							"option": "create_notification_with_the_following_parameters",
							"plugin_params": {
								"plugin_name": "mail",
								"from_details": {
									"state": "disabled"
								},
								"reply_to": {
									"state": "disabled"
								},
								"subject_for_host_notifications": {
									"state": "disabled"
								},
								"subject_for_service_notifications": {
									"state": "disabled"
								},
								"info_to_be_displayed_in_the_email_body": {
									"state": "disabled"
								},
								"insert_html_section_between_body_and_table": {
									"state": "disabled"
								},
								"url_prefix_for_links_to_checkmk": {
									"state": "disabled"
								},
								"sort_order_for_bulk_notifications": {
									"state": "disabled"
								},
								"send_separate_notification_to_every_recipient": {
									"state": "disabled"
								},
								"enable_sync_smtp": {
									"state": "disabled"
								},
								"display_graphs_among_each_other": {
									"state": "disabled"
								},
								"graphs_per_notification": {
									"state": "disabled"
								},
								"bulk_notifications_with_graphs": {
									"state": "disabled"
								}
							}
						},
						"notification_bulking": {
							"state": "disabled"
						}
					},
					"contact_selection": {
						"all_contacts_of_the_notified_object": {
							"state": "disabled"
						},
						"all_users": {
							"state": "disabled"
						},
						"all_users_with_an_email_address": {
							"state": "disabled"
						},
						"the_following_users": {
							"state": "disabled"
						},
						"members_of_contact_groups": {
							"state": "disabled"
						},
						"explicit_email_addresses": {
							"state": "disabled"
						},
						"restrict_by_custom_macros": {
							"state": "disabled"
						},
						"restrict_by_contact_groups": {
							"state": "disabled"
						}
					},
					"conditions": {
						"match_sites": {
							"state": "disabled"
						},
						"match_folder": {
							"state": "disabled"
						},
						"match_host_tags": {
							"state": "disabled"
						},
						"match_host_labels": {
							"state": "disabled"
						},
						"match_host_groups": {
							"state": "disabled"
						},
						"match_hosts": {
							"state": "disabled"
						},
						"match_exclude_hosts": {
							"state": "disabled"
						},
						"match_service_labels": {
							"state": "disabled"
						},
						"match_service_groups": {
							"state": "disabled"
						},
						"match_exclude_service_groups": {
							"state": "disabled"
						},
						"match_service_groups_regex": {
							"state": "disabled"
						},
						"match_exclude_service_groups_regex": {
							"state": "disabled"
						},
						"match_services": {
							"state": "disabled"
						},
						"match_exclude_services": {
							"state": "disabled"
						},
						"match_check_types": {
							"state": "disabled"
						},
						"match_plugin_output": {
							"state": "disabled"
						},
						"match_contact_groups": {
							"state": "disabled"
						},
						"match_service_levels": {
							"state": "disabled"
						},
						"match_only_during_time_period": {
							"state": "disabled"
						},
						"match_host_event_type": {
							"state": "disabled"
						},
						"match_service_event_type": {
							"state": "disabled"
						},
						"restrict_to_notification_numbers": {
							"state": "disabled"
						},
						"throttle_periodic_notifications": {
							"state": "disabled"
						},
						"match_notification_comment": {
							"state": "disabled"
						},
						"event_console_alerts": {
							"state": "disabled"
						}
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.notification_rules.delete_rule",
		"resourceLabel": "Notification Rules",
		"resource": "notificationRules",
		"summary": "Delete a notification rule",
		"method": "POST",
		"path": "/objects/notification_rule/{rule_id}/actions/delete/invoke",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The notification rule ID.",
				"example": "5425d554-5741-4bbf-b907-1a391dfab5bb"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.notification_rules.show_rule",
		"resourceLabel": "Notification Rules",
		"resource": "notificationRules",
		"summary": "Show a notification rule",
		"method": "GET",
		"path": "/objects/notification_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The notification rule ID.",
				"example": "5425d554-5741-4bbf-b907-1a391dfab5bb"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.notification_rules.show_rules",
		"resourceLabel": "Notification Rules",
		"resource": "notificationRules",
		"summary": "Show all notification rules",
		"method": "GET",
		"path": "/domain-types/notification_rule/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.notification_rules.put_rule",
		"resourceLabel": "Notification Rules",
		"resource": "notificationRules",
		"summary": "Update a notification rule",
		"method": "PUT",
		"path": "/objects/notification_rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The notification rule ID.",
				"example": "5425d554-5741-4bbf-b907-1a391dfab5bb"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/NotificationRuleRequest",
			"example": {
				"rule_config": {
					"rule_properties": {
						"description": "A description or title of this rule.",
						"comment": "A example comment.",
						"documentation_url": "http://link/to/documentation",
						"do_not_apply_this_rule": {
							"state": "disabled"
						},
						"allow_users_to_deactivate": {
							"state": "enabled"
						}
					},
					"notification_method": {
						"notify_plugin": {
							"option": "create_notification_with_the_following_parameters",
							"plugin_params": {
								"plugin_name": "mail",
								"from_details": {
									"state": "disabled"
								},
								"reply_to": {
									"state": "disabled"
								},
								"subject_for_host_notifications": {
									"state": "disabled"
								},
								"subject_for_service_notifications": {
									"state": "disabled"
								},
								"info_to_be_displayed_in_the_email_body": {
									"state": "disabled"
								},
								"insert_html_section_between_body_and_table": {
									"state": "disabled"
								},
								"url_prefix_for_links_to_checkmk": {
									"state": "disabled"
								},
								"sort_order_for_bulk_notifications": {
									"state": "disabled"
								},
								"send_separate_notification_to_every_recipient": {
									"state": "disabled"
								},
								"enable_sync_smtp": {
									"state": "disabled"
								},
								"display_graphs_among_each_other": {
									"state": "disabled"
								},
								"graphs_per_notification": {
									"state": "disabled"
								},
								"bulk_notifications_with_graphs": {
									"state": "disabled"
								}
							}
						},
						"notification_bulking": {
							"state": "disabled"
						}
					},
					"contact_selection": {
						"all_contacts_of_the_notified_object": {
							"state": "disabled"
						},
						"all_users": {
							"state": "disabled"
						},
						"all_users_with_an_email_address": {
							"state": "disabled"
						},
						"the_following_users": {
							"state": "disabled"
						},
						"members_of_contact_groups": {
							"state": "disabled"
						},
						"explicit_email_addresses": {
							"state": "disabled"
						},
						"restrict_by_custom_macros": {
							"state": "disabled"
						},
						"restrict_by_contact_groups": {
							"state": "disabled"
						}
					},
					"conditions": {
						"match_sites": {
							"state": "disabled"
						},
						"match_folder": {
							"state": "disabled"
						},
						"match_host_tags": {
							"state": "disabled"
						},
						"match_host_labels": {
							"state": "disabled"
						},
						"match_host_groups": {
							"state": "disabled"
						},
						"match_hosts": {
							"state": "disabled"
						},
						"match_exclude_hosts": {
							"state": "disabled"
						},
						"match_service_labels": {
							"state": "disabled"
						},
						"match_service_groups": {
							"state": "disabled"
						},
						"match_exclude_service_groups": {
							"state": "disabled"
						},
						"match_service_groups_regex": {
							"state": "disabled"
						},
						"match_exclude_service_groups_regex": {
							"state": "disabled"
						},
						"match_services": {
							"state": "disabled"
						},
						"match_exclude_services": {
							"state": "disabled"
						},
						"match_check_types": {
							"state": "disabled"
						},
						"match_plugin_output": {
							"state": "disabled"
						},
						"match_contact_groups": {
							"state": "disabled"
						},
						"match_service_levels": {
							"state": "disabled"
						},
						"match_only_during_time_period": {
							"state": "disabled"
						},
						"match_host_event_type": {
							"state": "disabled"
						},
						"match_service_event_type": {
							"state": "disabled"
						},
						"restrict_to_notification_numbers": {
							"state": "disabled"
						},
						"throttle_periodic_notifications": {
							"state": "disabled"
						},
						"match_notification_comment": {
							"state": "disabled"
						},
						"event_console_alerts": {
							"state": "disabled"
						}
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.parent_scan.start_parent_scan_background_job",
		"resourceLabel": "Parent Scan",
		"resource": "parentScan",
		"summary": "Start the parent scan background job",
		"method": "POST",
		"path": "/domain-types/parent_scan/actions/start/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ParentScan",
			"example": {
				"host_names": [
					"host1",
					"host2"
				],
				"performance": {
					"responses_timeout": 8,
					"hop_probes": 2,
					"max_gateway_distance": 10,
					"ping_probes": 5
				},
				"configuration": {
					"force_explicit_parents": false
				},
				"gateway_hosts": {
					"option": "no_gateway_hosts"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Start Parent Scan Background Job"
	},
	{
		"id": "cmk.gui.openapi.endpoints.password.create_password",
		"resourceLabel": "Passwords",
		"resource": "passwords",
		"summary": "Create a password",
		"method": "POST",
		"path": "/domain-types/password/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputPassword",
			"example": {
				"ident": "pass",
				"title": "Kubernetes login",
				"comment": "Kommentar",
				"documentation_url": "localhost",
				"password": "password",
				"owner": "admin",
				"editable_by": "admin",
				"shared": [
					"all"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.password.delete_password",
		"resourceLabel": "Passwords",
		"resource": "passwords",
		"summary": "Delete a password",
		"method": "DELETE",
		"path": "/objects/password/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.password.list_passwords",
		"resourceLabel": "Passwords",
		"resource": "passwords",
		"summary": "Show all passwords",
		"method": "GET",
		"path": "/domain-types/password/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.password.show_password",
		"resourceLabel": "Passwords",
		"resource": "passwords",
		"summary": "Show password store entry",
		"method": "GET",
		"path": "/objects/password/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Password Store Entry"
	},
	{
		"id": "cmk.gui.openapi.endpoints.password.update_password",
		"resourceLabel": "Passwords",
		"resource": "passwords",
		"summary": "Update a password",
		"method": "PUT",
		"path": "/objects/password/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdatePassword",
			"example": {
				"title": "Kubernetes login",
				"comment": "Kommentar",
				"documentation_url": "localhost",
				"password": "password",
				"owner": "admin",
				"editable_by": "admin",
				"shared": [
					"all"
				]
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.fetch_quick_setup_action_result",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Fetch the Quick action background job result",
		"method": "GET",
		"path": "/objects/quick_setup_action_result/{job_id}",
		"pathParameters": [
			{
				"name": "job_id",
				"kind": "string",
				"required": true,
				"description": "The id of the action job result to be fetched",
				"example": "quick_setup"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Fetch Quick Action Background Job Result"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.fetch_quick_setup_stage_action_result",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Fetch the Quick setup stage action background job result",
		"method": "GET",
		"path": "/objects/quick_setup_stage_action_result/{job_id}",
		"pathParameters": [
			{
				"name": "job_id",
				"kind": "string",
				"required": true,
				"description": "The id of the action job result to be fetched",
				"example": "quick_setup"
			}
		],
		"queryParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": false,
				"description": "The site where the quick setup stage action result is located. Defaults to local site",
				"example": "foobar"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Fetch Quick Setup Stage Action Background Job Result"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.get_guided_stages_or_overview_stages",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Get guided stages or overview stages",
		"method": "GET",
		"path": "/objects/quick_setup/{quick_setup_id}",
		"pathParameters": [
			{
				"name": "quick_setup_id",
				"kind": "string",
				"required": true,
				"description": "The quick setup id",
				"example": "aws"
			}
		],
		"queryParameters": [
			{
				"name": "mode",
				"kind": "string",
				"required": false,
				"description": "The quick setup mode",
				"example": "overview",
				"defaultValue": "guided",
				"enumValues": [
					"guided",
					"overview"
				]
			},
			{
				"name": "object_id",
				"kind": "string",
				"required": false,
				"description": "Select object id to prefill data for the quick setup",
				"example": "8558f956-3e45-4c4f-bd02-e88da17c99dd",
				"defaultValue": ""
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Guided Stages or Overview Stages"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.quick_setup_get_stage_structure",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Get a Quick setup stage structure",
		"method": "GET",
		"path": "/objects/quick_setup/{quick_setup_id}/quick_setup_stage/{stage_index}",
		"pathParameters": [
			{
				"name": "quick_setup_id",
				"kind": "string",
				"required": true,
				"description": "The quick setup id",
				"example": "aws"
			},
			{
				"name": "stage_index",
				"kind": "string",
				"required": true,
				"description": "The stage index",
				"example": "1"
			}
		],
		"queryParameters": [
			{
				"name": "object_id",
				"kind": "string",
				"required": false,
				"description": "Select object id to prefill data for the quick setup",
				"example": "8558f956-3e45-4c4f-bd02-e88da17c99dd",
				"defaultValue": ""
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Quick Setup Stage Structure"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.quick_setup_run_action",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Run a quick setup action",
		"method": "POST",
		"path": "/objects/quick_setup/{quick_setup_id}/actions/run-action/invoke",
		"pathParameters": [
			{
				"name": "quick_setup_id",
				"kind": "string",
				"required": true,
				"description": "The quick setup id",
				"example": "aws"
			}
		],
		"queryParameters": [
			{
				"name": "mode",
				"kind": "string",
				"required": false,
				"description": "The quick setup mode",
				"example": "overview",
				"defaultValue": "guided",
				"enumValues": [
					"guided",
					"overview"
				]
			},
			{
				"name": "search",
				"kind": "string",
				"required": false,
				"description": "Optional search query to preserve when redirecting after save",
				"example": "my rule",
				"defaultValue": ""
			}
		],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/QuickSetupFinalActionRequest",
			"example": {
				"button_id": "save",
				"stages": [
					{
						"stage_data": []
					},
					{
						"stage_data": []
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Run Quick Setup Action"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.quicksetup_run_stage_action",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Run a Quick setup stage validation and recap action",
		"method": "POST",
		"path": "/objects/quick_setup/{quick_setup_id}/actions/run-stage-action/invoke",
		"pathParameters": [
			{
				"name": "quick_setup_id",
				"kind": "string",
				"required": true,
				"description": "The quick setup id",
				"example": "aws"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/QuickSetupStageActionRequest",
			"example": {
				"stage_action_id": "test_connection",
				"stages": [
					{
						"form_data": {}
					},
					{
						"form_data": {}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Run Quick Setup Stage Validation and Recap Action"
	},
	{
		"id": "cmk.gui.openapi.endpoints.quick_setup.edit_quick_setup_action",
		"resourceLabel": "Quick Setup",
		"resource": "quickSetup",
		"summary": "Edit the quick setup",
		"method": "PUT",
		"path": "/objects/quick_setup/{quick_setup_id}/actions/edit/invoke",
		"pathParameters": [
			{
				"name": "quick_setup_id",
				"kind": "string",
				"required": true,
				"description": "The quick setup id",
				"example": "aws"
			}
		],
		"queryParameters": [
			{
				"name": "object_id",
				"kind": "string",
				"required": true,
				"description": "Select object id to prefill data for the quick setup",
				"example": "8558f956-3e45-4c4f-bd02-e88da17c99dd"
			},
			{
				"name": "search",
				"kind": "string",
				"required": false,
				"description": "Optional search query to preserve when redirecting after save",
				"example": "my rule",
				"defaultValue": ""
			}
		],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/QuickSetupFinalActionRequest",
			"example": {
				"button_id": "save",
				"stages": [
					{
						"stage_data": []
					},
					{
						"stage_data": []
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update Quick Setup"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.create_rule",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "Create rule",
		"method": "POST",
		"path": "/domain-types/rule/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputRuleObject",
			"example": {
				"properties": {
					"disabled": false
				},
				"value_raw": "{'cmk/os_family': 'linux'}",
				"conditions": {
					"host_name": {
						"match_on": [
							"host1",
							"host2"
						],
						"operator": "one_of"
					},
					"host_tags": [
						{
							"key": "criticality",
							"operator": "is",
							"value": "prod"
						}
					],
					"host_labels": [
						{
							"key": "os",
							"operator": "is",
							"value": "windows"
						}
					],
					"service_labels": [
						{
							"key": "os",
							"operator": "is",
							"value": "windows"
						}
					],
					"host_label_groups": [
						{
							"operator": "and",
							"label_group": [
								{
									"operator": "and",
									"label": "os:windows"
								}
							]
						}
					],
					"service_label_groups": [
						{
							"operator": "and",
							"label_group": [
								{
									"operator": "and",
									"label": "os:windows"
								}
							]
						}
					],
					"service_description": {
						"match_on": [
							"foo1",
							"bar2"
						],
						"operator": "none_of"
					}
				},
				"ruleset": "host_label_rules",
				"folder": "~hosts~linux"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.delete_rule",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "Delete a rule",
		"method": "DELETE",
		"path": "/objects/rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The ID of the rule.",
				"example": "0a168697-14a2-48d0-9c3c-ca65569a39e2"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.show_rule",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "Show a rule",
		"method": "GET",
		"path": "/objects/rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The ID of the rule.",
				"example": "0a168697-14a2-48d0-9c3c-ca65569a39e2"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.list_rules",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "List rules",
		"method": "GET",
		"path": "/domain-types/rule/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "ruleset_name",
				"kind": "string",
				"required": true,
				"description": "The name of the ruleset.",
				"example": "host_groups"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "List"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.move_rule_to",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "Move a rule to a specific location",
		"method": "POST",
		"path": "/objects/rule/{rule_id}/actions/move/invoke",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The ID of the rule.",
				"example": "0a168697-14a2-48d0-9c3c-ca65569a39e2"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/MoveRuleTo",
			"example": {
				"position": "top_of_folder",
				"folder": "/"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Move Rule to Specific Location"
	},
	{
		"id": "cmk.gui.openapi.endpoints.rule.edit_rule",
		"resourceLabel": "Rules",
		"resource": "rules",
		"summary": "Modify a rule",
		"method": "PUT",
		"path": "/objects/rule/{rule_id}",
		"pathParameters": [
			{
				"name": "rule_id",
				"kind": "string",
				"required": true,
				"description": "The ID of the rule.",
				"example": "0a168697-14a2-48d0-9c3c-ca65569a39e2"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateRuleObject",
			"example": {
				"properties": {
					"disabled": false
				},
				"value_raw": "{'cmk/os_family': 'linux'}",
				"conditions": {
					"host_name": {
						"match_on": [
							"host1",
							"host2"
						],
						"operator": "one_of"
					},
					"host_tags": [
						{
							"key": "criticality",
							"operator": "is",
							"value": "prod"
						}
					],
					"host_labels": [
						{
							"key": "os",
							"operator": "is",
							"value": "windows"
						}
					],
					"service_labels": [
						{
							"key": "os",
							"operator": "is",
							"value": "windows"
						}
					],
					"host_label_groups": [
						{
							"operator": "and",
							"label_group": [
								{
									"operator": "and",
									"label": "os:windows"
								}
							]
						}
					],
					"service_label_groups": [
						{
							"operator": "and",
							"label_group": [
								{
									"operator": "and",
									"label": "os:windows"
								}
							]
						}
					],
					"service_description": {
						"match_on": [
							"foo1",
							"bar2"
						],
						"operator": "none_of"
					}
				}
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ruleset.show_ruleset",
		"resourceLabel": "Rulesets",
		"resource": "rulesets",
		"summary": "Show a ruleset",
		"method": "GET",
		"path": "/objects/ruleset/{ruleset_name}",
		"pathParameters": [
			{
				"name": "ruleset_name",
				"kind": "string",
				"required": true,
				"description": "The name of the ruleset.",
				"example": "host_groups"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.ruleset.list_rulesets",
		"resourceLabel": "Rulesets",
		"resource": "rulesets",
		"summary": "Search rule sets",
		"method": "GET",
		"path": "/domain-types/ruleset/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "fulltext",
				"kind": "string",
				"required": false,
				"description": "Search all keys (like `name`, `title`, `help`, etc.) for this text. Regex allowed."
			},
			{
				"name": "folder",
				"kind": "string",
				"required": false,
				"description": "The folder in which to search for rules. Path delimiters can be either `~`, `/` or `\\`. Please use the one most appropriate for your quoting/escaping needs. A good default choice is `~`."
			},
			{
				"name": "deprecated",
				"kind": "boolean",
				"required": false,
				"description": "Only show deprecated rulesets. Defaults to False.",
				"example": false,
				"defaultValue": false
			},
			{
				"name": "used",
				"kind": "boolean",
				"required": false,
				"description": "Only show used rulesets. Defaults to True.",
				"example": true,
				"defaultValue": true
			},
			{
				"name": "name",
				"kind": "string",
				"required": false,
				"description": "A regex of the name."
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Search"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.execute_service_discovery",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Execute a service discovery on a host",
		"method": "POST",
		"path": "/domain-types/service_discovery_run/actions/start/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/DiscoverServices",
			"example": {
				"host_name": "example.com",
				"mode": "refresh"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Execute Service Discovery on Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.show_service_discovery_result",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Show the current service discovery result",
		"method": "GET",
		"path": "/objects/service_discovery/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "The host of the service discovery result",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Current Service Discovery Result"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.show_service_discovery_run",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Show the last service discovery background job on a host",
		"method": "GET",
		"path": "/objects/service_discovery_run/{host_name}",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Last Service Discovery Background Job on Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.execute_bulk_discovery",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Start a bulk discovery job",
		"method": "POST",
		"path": "/domain-types/discovery_run/actions/bulk-discovery-start/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkDiscovery",
			"example": {
				"hostnames": [
					"example",
					"sample"
				],
				"options": {
					"monitor_undecided_services": true,
					"remove_vanished_services": true,
					"update_service_labels": true,
					"update_service_parameters": true,
					"update_host_labels": true
				},
				"do_full_scan": true,
				"bulk_size": 10,
				"ignore_errors": true
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Start Bulk Discovery Job"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.update_service_phase",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Update the phase of a service",
		"method": "PUT",
		"path": "/objects/host/{host_name}/actions/update_discovery_phase/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "The host of the service which shall be updated.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateDiscoveryPhase",
			"example": {
				"check_type": "df",
				"service_item": "/home",
				"target_phase": "monitored"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update Phase of Service"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_discovery.service_discovery_run_wait_for_completion",
		"resourceLabel": "Service Discovery",
		"resource": "serviceDiscovery",
		"summary": "Wait for service discovery completion",
		"method": "GET",
		"path": "/objects/service_discovery_run/{host_name}/actions/wait-for-completion/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Wait for Service Discovery Completion"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.bulk_create",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Bulk create service groups",
		"method": "POST",
		"path": "/domain-types/service_group_config/actions/bulk-create/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkInputServiceGroup",
			"example": {
				"entries": [
					{
						"name": "environment",
						"alias": "Environment Sensors"
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.bulk_delete",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Bulk delete service groups",
		"method": "POST",
		"path": "/domain-types/service_group_config/actions/bulk-delete/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkDeleteServiceGroup",
			"example": {
				"entries": [
					"windows",
					"panels"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.bulk_update",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Bulk update service groups",
		"method": "PUT",
		"path": "/domain-types/service_group_config/actions/bulk-update/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/BulkUpdateServiceGroup",
			"example": {
				"entries": [
					{
						"name": "windows",
						"attributes": {
							"alias": "Windows Servers"
						}
					}
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Bulk Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.create",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Create a service group",
		"method": "POST",
		"path": "/domain-types/service_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/InputServiceGroup",
			"example": {
				"name": "windows",
				"alias": "Environment Sensors"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.delete",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Delete a service group",
		"method": "DELETE",
		"path": "/objects/service_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.show_group",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Show a service group",
		"method": "GET",
		"path": "/objects/service_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.list_groups",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Show all service groups",
		"method": "GET",
		"path": "/domain-types/service_group_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service_group_config.update",
		"resourceLabel": "Service Groups",
		"resource": "serviceGroups",
		"summary": "Update a service group",
		"method": "PUT",
		"path": "/objects/service_group_config/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "The identifier name of the group.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateServiceGroupAttributes",
			"example": {
				"alias": "Example Group"
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service._list_all_services",
		"resourceLabel": "Service Status",
		"resource": "serviceStatus",
		"summary": "Show all monitored services",
		"method": "POST",
		"path": "/domain-types/service/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ServiceParametersWithHost",
			"example": {
				"sites": [
					"mysite"
				],
				"columns": [
					"host_name",
					"description"
				],
				"query": {
					"op": "=",
					"left": "host_name",
					"right": "example.com"
				},
				"host_name": "example.com"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service._list_all_services_deprecated-17512",
		"resourceLabel": "Service Status",
		"resource": "serviceStatus",
		"summary": "Show all monitored services",
		"method": "GET",
		"path": "/domain-types/service/collections/all",
		"pathParameters": [],
		"queryParameters": [
			{
				"name": "sites",
				"kind": "array",
				"required": false,
				"description": "Restrict the query to this particular site.",
				"example": [
					"mysite"
				],
				"defaultValue": []
			},
			{
				"name": "columns",
				"kind": "array",
				"required": false,
				"description": "The desired columns of the `services` table. If left empty, a default set of columns is used.",
				"example": [
					"host_name",
					"description"
				],
				"defaultValue": [
					"host_name",
					"description"
				]
			},
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'services' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			},
			{
				"name": "host_name",
				"kind": "string",
				"required": false,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": true,
		"label": "Get Many (deprecated)"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service._list_host_services",
		"resourceLabel": "Service Status",
		"resource": "serviceStatus",
		"summary": "Show the monitored services of a host",
		"method": "POST",
		"path": "/objects/host/{host_name}/collections/services",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/ServiceParameters",
			"example": {
				"sites": [
					"mysite"
				],
				"columns": [
					"host_name",
					"description"
				],
				"query": {
					"op": "=",
					"left": "host_name",
					"right": "example.com"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Monitored Services of Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service._list_host_services_deprecated-17512",
		"resourceLabel": "Service Status",
		"resource": "serviceStatus",
		"summary": "Show the monitored services of a host",
		"method": "GET",
		"path": "/objects/host/{host_name}/collections/services",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [
			{
				"name": "sites",
				"kind": "array",
				"required": false,
				"description": "Restrict the query to this particular site.",
				"example": [
					"mysite"
				],
				"defaultValue": []
			},
			{
				"name": "columns",
				"kind": "array",
				"required": false,
				"description": "The desired columns of the `services` table. If left empty, a default set of columns is used.",
				"example": [
					"host_name",
					"description"
				],
				"defaultValue": [
					"host_name",
					"description"
				]
			},
			{
				"name": "query",
				"kind": "string",
				"required": false,
				"description": "An query expression of the Livestatus 'services' table in nested dictionary form. If you want to use multiple expressions, nest them with the AND/OR operators."
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": true,
		"label": "Get Monitored Services of Host (deprecated)"
	},
	{
		"id": "cmk.gui.openapi.endpoints.service.show_service",
		"resourceLabel": "Service Status",
		"resource": "serviceStatus",
		"summary": "Show a single service of a specific host",
		"method": "GET",
		"path": "/objects/host/{host_name}/actions/show_service/invoke",
		"pathParameters": [
			{
				"name": "host_name",
				"kind": "string",
				"required": true,
				"description": "A host name.",
				"example": "example.com"
			}
		],
		"queryParameters": [
			{
				"name": "service_description",
				"kind": "string",
				"required": true,
				"description": "The service name of the selected host",
				"example": "Filesystem /boot"
			},
			{
				"name": "columns",
				"kind": "array",
				"required": false,
				"description": "The desired columns of the `services` table. If left empty, a default set of columns is used.",
				"example": [
					"state",
					"state_type"
				],
				"defaultValue": [
					"host_name",
					"description",
					"state",
					"state_type",
					"last_check"
				]
			}
		],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get Single Service of Specific Host"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.post_site",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Create a site connection",
		"method": "POST",
		"path": "/domain-types/site_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/SiteConnectionRequestCreate",
			"example": {
				"site_config": {
					"basic_settings": {
						"alias": "Die remote site 1",
						"site_id": "site_id_1"
					},
					"status_connection": {
						"connection": {
							"socket_type": "tcp",
							"host": "192.168.1.1",
							"port": 1253,
							"encrypted": true,
							"verify": false
						},
						"proxy": {
							"use_livestatus_daemon": "with_proxy",
							"global_settings": false,
							"params": {
								"channels": 15,
								"heartbeat": {
									"interval": 12,
									"timeout": 3
								},
								"channel_timeout": 3.5,
								"query_timeout": 120.2,
								"connect_retry": 4.6,
								"cache": true
							},
							"tcp": {
								"port": 6560,
								"only_from": [
									"192.168.1.1"
								],
								"tls": false
							}
						},
						"connect_timeout": 2,
						"persistent_connection": false,
						"url_prefix": "/my_remote_site_1/",
						"status_host": {
							"status_host_set": "disabled"
						},
						"disable_in_status_gui": false
					},
					"configuration_connection": {
						"enable_replication": true,
						"url_of_remote_site": "http://localhost/my_remote_site_id_1/check_mk/",
						"disable_remote_configuration": true,
						"ignore_tls_errors": false,
						"direct_login_to_web_gui_allowed": true,
						"user_sync": {
							"sync_with_ldap_connections": "all"
						},
						"replicate_event_console": true,
						"replicate_extensions": true,
						"message_broker_port": 5672,
						"is_trusted": false
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.delete_site",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Delete a site connection",
		"method": "POST",
		"path": "/objects/site_connection/{site_id}/actions/delete/invoke",
		"pathParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "The site ID.",
				"example": "prod"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.show_site",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Show a site connection",
		"method": "GET",
		"path": "/objects/site_connection/{site_id}",
		"pathParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "A site ID that exists.",
				"example": "prod"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.show_sites",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Show all site connections",
		"method": "GET",
		"path": "/domain-types/site_connection/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.site_login",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Login to a remote site",
		"method": "POST",
		"path": "/objects/site_connection/{site_id}/actions/login/invoke",
		"pathParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "A site ID that exists.",
				"example": "prod"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/SiteLoginRequest",
			"example": {
				"username": "cmkadmin",
				"password": "password"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Log in to Remote Site"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.site_logout",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Logout from a remote site",
		"method": "POST",
		"path": "/objects/site_connection/{site_id}/actions/logout/invoke",
		"pathParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "A site ID that exists.",
				"example": "prod"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Log Out from Remote Site"
	},
	{
		"id": "cmk.gui.openapi.endpoints.site_management.put_site",
		"resourceLabel": "Site Management",
		"resource": "siteManagement",
		"summary": "Update a site connection",
		"method": "PUT",
		"path": "/objects/site_connection/{site_id}",
		"pathParameters": [
			{
				"name": "site_id",
				"kind": "string",
				"required": true,
				"description": "A site ID that exists.",
				"example": "prod"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/SiteConnectionRequestUpdate",
			"example": {
				"site_config": {
					"basic_settings": {
						"alias": "Die remote site 1",
						"site_id": "site_id_1"
					},
					"status_connection": {
						"connection": {
							"socket_type": "tcp",
							"host": "192.168.1.1",
							"port": 1253,
							"encrypted": true,
							"verify": false
						},
						"proxy": {
							"use_livestatus_daemon": "with_proxy",
							"global_settings": false,
							"params": {
								"channels": 15,
								"heartbeat": {
									"interval": 12,
									"timeout": 3
								},
								"channel_timeout": 3.5,
								"query_timeout": 120.2,
								"connect_retry": 4.6,
								"cache": true
							},
							"tcp": {
								"port": 6560,
								"only_from": [
									"192.168.1.1"
								],
								"tls": false
							}
						},
						"connect_timeout": 2,
						"persistent_connection": false,
						"url_prefix": "/my_remote_site_1/",
						"status_host": {
							"status_host_set": "disabled"
						},
						"disable_in_status_gui": false
					},
					"configuration_connection": {
						"enable_replication": true,
						"url_of_remote_site": "http://localhost/my_remote_site_id_1/check_mk/",
						"disable_remote_configuration": true,
						"ignore_tls_errors": false,
						"direct_login_to_web_gui_allowed": true,
						"user_sync": {
							"sync_with_ldap_connections": "all"
						},
						"replicate_event_console": true,
						"replicate_extensions": true,
						"message_broker_port": 5672,
						"is_trusted": false
					}
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.time_periods.create_timeperiod",
		"resourceLabel": "Time Periods",
		"resource": "timePeriods",
		"summary": "Create a time period",
		"method": "POST",
		"path": "/domain-types/time_period/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateTimePeriod",
			"example": {
				"name": "first",
				"alias": "alias",
				"active_time_ranges": [
					{
						"day": "monday",
						"time_ranges": [
							{
								"start": "12:00:00",
								"end": "14:00:00"
							}
						]
					}
				],
				"exceptions": [
					{
						"date": "2020-01-01",
						"time_ranges": [
							{
								"start": "14:00:00",
								"end": "18:00:00"
							}
						]
					}
				],
				"exclude": [
					"name"
				]
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.time_periods.delete",
		"resourceLabel": "Time Periods",
		"resource": "timePeriods",
		"summary": "Delete a time period",
		"method": "DELETE",
		"path": "/objects/time_period/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.time_periods.show_time_period",
		"resourceLabel": "Time Periods",
		"resource": "timePeriods",
		"summary": "Show a time period",
		"method": "GET",
		"path": "/objects/time_period/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.time_periods.list_time_periods",
		"resourceLabel": "Time Periods",
		"resource": "timePeriods",
		"summary": "Show all time periods",
		"method": "GET",
		"path": "/domain-types/time_period/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.time_periods.update_timeperiod",
		"resourceLabel": "Time Periods",
		"resource": "timePeriods",
		"summary": "Update a time period",
		"method": "PUT",
		"path": "/objects/time_period/{name}",
		"pathParameters": [
			{
				"name": "name",
				"kind": "string",
				"required": true,
				"description": "A name used as an identifier. Can be of arbitrary (sensible) length.",
				"example": "pathname"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateTimePeriod",
			"example": {
				"alias": "new_alias",
				"active_time_ranges": [
					{
						"day": "monday",
						"time_ranges": [
							{
								"start": "12:00:00",
								"end": "14:00:00"
							}
						]
					}
				],
				"exceptions": [
					{
						"date": "2020-01-01",
						"time_ranges": [
							{
								"start": "14:00:00",
								"end": "18:00:00"
							}
						]
					}
				],
				"exclude": [
					"time_name"
				]
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_role.create_userrole",
		"resourceLabel": "User Roles",
		"resource": "userRoles",
		"summary": "Create/clone a user role",
		"method": "POST",
		"path": "/domain-types/user_role/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateUserRole",
			"example": {
				"role_id": "admin",
				"new_role_id": "limited_permissions_user",
				"new_alias": "user_a"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_role.delete_userrole",
		"resourceLabel": "User Roles",
		"resource": "userRoles",
		"summary": "Delete a user role",
		"method": "DELETE",
		"path": "/objects/user_role/{role_id}",
		"pathParameters": [
			{
				"name": "role_id",
				"kind": "string",
				"required": true,
				"description": "An existing custom user role that you want to delete.",
				"example": "userx"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_role.show_user_role",
		"resourceLabel": "User Roles",
		"resource": "userRoles",
		"summary": "Show a user role",
		"method": "GET",
		"path": "/objects/user_role/{role_id}",
		"pathParameters": [
			{
				"name": "role_id",
				"kind": "string",
				"required": true,
				"description": "An existing user role.",
				"example": "userx"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_role.list_user_roles",
		"resourceLabel": "User Roles",
		"resource": "userRoles",
		"summary": "Show all user roles",
		"method": "GET",
		"path": "/domain-types/user_role/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_role.edit_userrole",
		"resourceLabel": "User Roles",
		"resource": "userRoles",
		"summary": "Edit a user role",
		"method": "PUT",
		"path": "/objects/user_role/{role_id}",
		"pathParameters": [
			{
				"name": "role_id",
				"kind": "string",
				"required": true,
				"description": "An existing user role.",
				"example": "userx"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/EditUserRole",
			"example": {
				"new_role_id": "new_userrole_id",
				"new_alias": "new_userrole_alias",
				"new_basedon": "guest",
				"new_permissions": {
					"general.edit_profile": "yes",
					"general.message": "no"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.create_user",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Create a user",
		"method": "POST",
		"path": "/domain-types/user_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/CreateUser",
			"example": {
				"username": "cmkuser",
				"fullname": "Mathias Kettner",
				"auth_option": {
					"auth_type": "password",
					"password": "password"
				},
				"disable_login": false,
				"contact_options": {
					"email": "user@example.com"
				},
				"pager_address": "",
				"idle_timeout": {
					"option": "global"
				},
				"roles": [
					"user"
				],
				"authorized_sites": [
					"mysite"
				],
				"contactgroups": [
					"all"
				],
				"disable_notifications": {
					"disable": false
				},
				"language": "en",
				"temperature_unit": "celsius",
				"interface_options": {
					"interface_theme": "dark"
				}
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Create"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.delete_user",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Delete a user",
		"method": "DELETE",
		"path": "/objects/user_config/{username}",
		"pathParameters": [
			{
				"name": "username",
				"kind": "string",
				"required": true,
				"description": "An unique username for the user",
				"example": "cmkuser"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Delete"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.show_user",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Show a user",
		"method": "GET",
		"path": "/objects/user_config/{username}",
		"pathParameters": [
			{
				"name": "username",
				"kind": "string",
				"required": true,
				"description": "An unique username for the user",
				"example": "cmkuser"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Get"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.list_users",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Show all users",
		"method": "GET",
		"path": "/domain-types/user_config/collections/all",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"ifMatch": false,
		"paginated": true,
		"deprecated": false,
		"label": "Get Many"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.dismiss_user_warning",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Save a warning dismissal for the current user.",
		"method": "POST",
		"path": "/domain-types/user_config/actions/dismiss-warning/invoke",
		"pathParameters": [],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UserDismissWarning",
			"example": {
				"warning": "notification_fallback"
			}
		},
		"ifMatch": false,
		"paginated": false,
		"deprecated": false,
		"label": "Save Warning Dismissal for Current User"
	},
	{
		"id": "cmk.gui.openapi.endpoints.user_config.edit_user",
		"resourceLabel": "Users",
		"resource": "users",
		"summary": "Edit a user",
		"method": "PUT",
		"path": "/objects/user_config/{username}",
		"pathParameters": [
			{
				"name": "username",
				"kind": "string",
				"required": true,
				"description": "An unique username for the user",
				"example": "cmkuser"
			}
		],
		"queryParameters": [],
		"headerParameters": [],
		"requestBody": {
			"required": true,
			"schemaRef": "#/components/schemas/UpdateUser",
			"example": {
				"fullname": "Mathias Kettner",
				"auth_option": {
					"auth_type": "password",
					"password": "password"
				},
				"disable_login": false,
				"contact_options": {
					"email": "user@example.com"
				},
				"pager_address": "",
				"idle_timeout": {},
				"roles": [
					"user"
				],
				"authorized_sites": [
					"mysite"
				],
				"contactgroups": [
					"all"
				],
				"disable_notifications": {
					"disabled": false
				},
				"language": "en",
				"temperature_unit": "celsius",
				"interface_options": {
					"interface_theme": "dark"
				}
			}
		},
		"ifMatch": true,
		"paginated": false,
		"deprecated": false,
		"label": "Update"
	},
];

export const RESOURCES: ApiResource[] = [
	{
		"value": "acknowledgeProblems",
		"label": "Acknowledge Problems"
	},
	{
		"value": "activateChanges",
		"label": "Activate Changes"
	},
	{
		"value": "agents",
		"label": "Agents"
	},
	{
		"value": "auditLogs",
		"label": "Audit Logs"
	},
	{
		"value": "autocompleteInternal",
		"label": "Autocomplete (internal)"
	},
	{
		"value": "auxTags",
		"label": "Aux Tags"
	},
	{
		"value": "backgroundJobs",
		"label": "Background Jobs"
	},
	{
		"value": "brokerConnection",
		"label": "Broker Connection"
	},
	{
		"value": "businessIntelligenceBI",
		"label": "Business Intelligence (BI)"
	},
	{
		"value": "certificates",
		"label": "Certificates"
	},
	{
		"value": "comments",
		"label": "Comments"
	},
	{
		"value": "configurationEntities",
		"label": "Configuration Entities"
	},
	{
		"value": "configurationEntitiesFolder",
		"label": "Configuration Entities / Folder"
	},
	{
		"value": "configurationEntitiesNotificationParameter",
		"label": "Configuration Entities / Notification Parameter"
	},
	{
		"value": "configurationEntitiesPasswordstorePassword",
		"label": "Configuration Entities / Passwordstore Password"
	},
	{
		"value": "contactGroups",
		"label": "Contact Groups"
	},
	{
		"value": "downtimes",
		"label": "Downtimes"
	},
	{
		"value": "eventConsole",
		"label": "Event Console"
	},
	{
		"value": "folders",
		"label": "Folders"
	},
	{
		"value": "hostGroups",
		"label": "Host Groups"
	},
	{
		"value": "hostStatus",
		"label": "Host Status"
	},
	{
		"value": "hostTagGroups",
		"label": "Host Tag Groups"
	},
	{
		"value": "hosts",
		"label": "Hosts"
	},
	{
		"value": "hostsInternal",
		"label": "Hosts (internal)"
	},
	{
		"value": "lDAPConnections",
		"label": "LDAP Connections"
	},
	{
		"value": "metrics",
		"label": "Metrics"
	},
	{
		"value": "miscellaneous",
		"label": "Miscellaneous"
	},
	{
		"value": "notificationRules",
		"label": "Notification Rules"
	},
	{
		"value": "parentScan",
		"label": "Parent Scan"
	},
	{
		"value": "passwords",
		"label": "Passwords"
	},
	{
		"value": "quickSetup",
		"label": "Quick Setup"
	},
	{
		"value": "rules",
		"label": "Rules"
	},
	{
		"value": "rulesets",
		"label": "Rulesets"
	},
	{
		"value": "serviceDiscovery",
		"label": "Service Discovery"
	},
	{
		"value": "serviceGroups",
		"label": "Service Groups"
	},
	{
		"value": "serviceStatus",
		"label": "Service Status"
	},
	{
		"value": "siteManagement",
		"label": "Site Management"
	},
	{
		"value": "timePeriods",
		"label": "Time Periods"
	},
	{
		"value": "userRoles",
		"label": "User Roles"
	},
	{
		"value": "users",
		"label": "Users"
	},
];
