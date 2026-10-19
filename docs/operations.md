# Generated operations

Generated from the Checkmk REST API 1.0 OpenAPI document by `npm run generate`. Do not edit by hand.

- Operations: 189
- Resources: 40

| Resource | Operation | Method | Path | Notes |
| --- | --- | --- | --- | --- |
| Acknowledge problems | POST Remove acknowledgement on host or service problems. | POST | `/domain-types/acknowledge/actions/delete/invoke` |  |
| Acknowledge problems | POST Set acknowledgement on related hosts | POST | `/domain-types/acknowledge/collections/host` |  |
| Acknowledge problems | POST Set acknowledgement on related services | POST | `/domain-types/acknowledge/collections/service` |  |
| Activate changes | GET Show all currently running activations | GET | `/domain-types/activation_run/collections/running` |  |
| Activate changes | GET Show all pending changes | GET | `/domain-types/activation_run/collections/pending_changes` |  |
| Activate changes | GET Show the activation status | GET | `/objects/activation_run/{activation_id}` |  |
| Activate changes | GET Wait for activation completion | GET | `/objects/activation_run/{activation_id}/actions/wait-for-completion/invoke` |  |
| Activate changes | POST Activate pending changes | POST | `/domain-types/activation_run/actions/activate-changes/invoke` |  |
| Agents | GET Download agents shipped with Checkmk | GET | `/domain-types/agent/actions/download/invoke` |  |
| Audit logs | GET Get all audit log entries | GET | `/domain-types/audit_log/collections/all` |  |
| Audit logs | POST Move audit log entries to archive | POST | `/domain-types/audit_log/actions/archive/invoke` |  |
| Autocomplete (internal) | POST Call the autocompleter specified in the url | POST | `/objects/autocomplete/{autocomplete_id}` |  |
| Aux Tags | GET Show an Auxiliary Tag | GET | `/objects/aux_tag/{aux_tag_id}` |  |
| Aux Tags | GET Show Auxiliary Tags | GET | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | POST Create an Auxiliary Tag | POST | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | POST Delete an Auxiliary Tag | POST | `/objects/aux_tag/{aux_tag_id}/actions/delete/invoke` |  |
| Aux Tags | PUT Update an aux tag | PUT | `/objects/aux_tag/{aux_tag_id}` |  |
| Background Jobs | GET Show the last status of a background job | GET | `/objects/background_job/{job_id}` |  |
| Broker Connection | DELETE Delete a peer to peer broker connection | DELETE | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | GET Show a peer to peer broker connection | GET | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | GET Show all peer to peer broker connections | GET | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | POST Create a peer to peer broker connection | POST | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | PUT Edit a peer to peer broker connection | PUT | `/objects/broker_connection/{connection_id}` |  |
| Business intelligence (BI) | DELETE Delete a BI aggregation | DELETE | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business intelligence (BI) | DELETE Delete BI pack | DELETE | `/objects/bi_pack/{pack_id}` |  |
| Business intelligence (BI) | DELETE Delete BI rule | DELETE | `/objects/bi_rule/{rule_id}` |  |
| Business intelligence (BI) | GET Get a BI aggregation | GET | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business intelligence (BI) | GET Get a BI pack and its rules and aggregations | GET | `/objects/bi_pack/{pack_id}` |  |
| Business intelligence (BI) | GET Get the state of BI aggregations | GET | `/domain-types/bi_aggregation/actions/aggregation_state/invoke` |  |
| Business intelligence (BI) | GET Show a BI rule | GET | `/objects/bi_rule/{rule_id}` |  |
| Business intelligence (BI) | GET Show all BI packs | GET | `/domain-types/bi_pack/collections/all` |  |
| Business intelligence (BI) | POST Create a BI aggregation | POST | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business intelligence (BI) | POST Create a new BI pack | POST | `/objects/bi_pack/{pack_id}` |  |
| Business intelligence (BI) | POST Create a new BI rule | POST | `/objects/bi_rule/{rule_id}` |  |
| Business intelligence (BI) | POST Get the state of BI aggregations | POST | `/domain-types/bi_aggregation/actions/aggregation_state/invoke` |  |
| Business intelligence (BI) | PUT Update an existing BI aggregation | PUT | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business intelligence (BI) | PUT Update an existing BI pack | PUT | `/objects/bi_pack/{pack_id}` |  |
| Business intelligence (BI) | PUT Update an existing BI rule | PUT | `/objects/bi_rule/{rule_id}` |  |
| Certificates | GET Show agent controller certificate settings | GET | `/agent_controller_certificates_settings` |  |
| Certificates | GET X.509 PEM-encoded root certificate | GET | `/root_cert` |  |
| Certificates | POST X.509 PEM-encoded Certificate Signing Requests (CSRs) | POST | `/csr` |  |
| Comments | GET Show a comment | GET | `/objects/comment/{comment_id}` |  |
| Comments | GET Show comments | GET | `/domain-types/comment/collections/{collection_name}` |  |
| Comments | POST Create a host comment | POST | `/domain-types/comment/collections/host` |  |
| Comments | POST Create a service comment | POST | `/domain-types/comment/collections/service` |  |
| Comments | POST Delete comments | POST | `/domain-types/comment/actions/delete/invoke` |  |
| Configuration entities | GET Get a configuration entity form spec schema | GET | `/domain-types/form_spec/collections/{entity_type}` |  |
| Configuration entities | POST Create a configuration entity | POST | `/domain-types/configuration_entity/collections/all` |  |
| Configuration entities | PUT Update an existing configuration entity | PUT | `/domain-types/configuration_entity/actions/edit-single-entity/invoke` |  |
| Configuration entities / Folder | GET List existing folder | GET | `/domain-types/folder/collections/{entity_type_specifier}` |  |
| Configuration entities / Notification Parameter | GET Get a notification parameter | GET | `/objects/notification_parameter/{entity_id}` |  |
| Configuration entities / Notification Parameter | GET List existing notification parameters | GET | `/domain-types/notification_parameter/collections/{entity_type_specifier}` |  |
| Configuration entities / Passwordstore Password | GET List existing passwordstore passwords | GET | `/domain-types/passwordstore_password/collections/{entity_type_specifier}` |  |
| Contact groups | DELETE Delete a contact group | DELETE | `/objects/contact_group_config/{name}` |  |
| Contact groups | GET Show a contact group | GET | `/objects/contact_group_config/{name}` |  |
| Contact groups | GET Show all contact groups | GET | `/domain-types/contact_group_config/collections/all` |  |
| Contact groups | POST Bulk create contact groups | POST | `/domain-types/contact_group_config/actions/bulk-create/invoke` |  |
| Contact groups | POST Bulk delete contact groups | POST | `/domain-types/contact_group_config/actions/bulk-delete/invoke` |  |
| Contact groups | POST Create a contact group | POST | `/domain-types/contact_group_config/collections/all` |  |
| Contact groups | PUT Bulk update contact groups | PUT | `/domain-types/contact_group_config/actions/bulk-update/invoke` |  |
| Contact groups | PUT Update a contact group | PUT | `/objects/contact_group_config/{name}` |  |
| Downtimes | GET Show all scheduled downtimes | GET | `/domain-types/downtime/collections/all` |  |
| Downtimes | GET Show downtime | GET | `/objects/downtime/{downtime_id}` |  |
| Downtimes | POST Create a host related scheduled downtime | POST | `/domain-types/downtime/collections/host` |  |
| Downtimes | POST Create a service related scheduled downtime | POST | `/domain-types/downtime/collections/service` |  |
| Downtimes | POST Delete a scheduled downtime | POST | `/domain-types/downtime/actions/delete/invoke` |  |
| Downtimes | PUT Modify a scheduled downtime | PUT | `/domain-types/downtime/actions/modify/invoke` |  |
| Event Console | GET Show an event | GET | `/objects/event_console/{event_id}` |  |
| Event Console | GET Show events | GET | `/domain-types/event_console/collections/all` |  |
| Event Console | POST Archive events | POST | `/domain-types/event_console/actions/delete/invoke` |  |
| Event Console | POST Change event state | POST | `/objects/event_console/{event_id}/actions/change_state/invoke` |  |
| Event Console | POST Change multiple event states | POST | `/domain-types/event_console/actions/change_state/invoke` |  |
| Event Console | POST Update and acknowledge an event | POST | `/objects/event_console/{event_id}/actions/update_and_acknowledge/invoke` |  |
| Event Console | POST Update and acknowledge events | POST | `/domain-types/event_console/actions/update_and_acknowledge/invoke` |  |
| Folders | DELETE Delete a folder | DELETE | `/objects/folder_config/{folder}` |  |
| Folders | GET Show a folder | GET | `/objects/folder_config/{folder}` |  |
| Folders | GET Show all folders | GET | `/domain-types/folder_config/collections/all` |  |
| Folders | GET Show all hosts in a folder | GET | `/objects/folder_config/{folder}/collections/hosts` |  |
| Folders | POST Create a folder | POST | `/domain-types/folder_config/collections/all` |  |
| Folders | POST Move a folder | POST | `/objects/folder_config/{folder}/actions/move/invoke` |  |
| Folders | PUT Bulk update folders | PUT | `/domain-types/folder_config/actions/bulk-update/invoke` |  |
| Folders | PUT Update a folder | PUT | `/objects/folder_config/{folder}` |  |
| Host groups | DELETE Delete a host group | DELETE | `/objects/host_group_config/{name}` |  |
| Host groups | GET Show a host group | GET | `/objects/host_group_config/{name}` |  |
| Host groups | GET Show all host groups | GET | `/domain-types/host_group_config/collections/all` |  |
| Host groups | POST Bulk create host groups | POST | `/domain-types/host_group_config/actions/bulk-create/invoke` |  |
| Host groups | POST Bulk delete host groups | POST | `/domain-types/host_group_config/actions/bulk-delete/invoke` |  |
| Host groups | POST Create a host group | POST | `/domain-types/host_group_config/collections/all` |  |
| Host groups | PUT Bulk update host groups | PUT | `/domain-types/host_group_config/actions/bulk-update/invoke` |  |
| Host groups | PUT Update a host group | PUT | `/objects/host_group_config/{name}` |  |
| Host status | GET Show host | GET | `/objects/host/{host_name}` |  |
| Host status | GET Show hosts of specific condition (deprecated) | GET | `/domain-types/host/collections/all` | deprecated |
| Host status | POST Show hosts of specific condition | POST | `/domain-types/host/collections/all` |  |
| Host tag groups | DELETE Delete a host tag group | DELETE | `/objects/host_tag_group/{name}` |  |
| Host tag groups | GET Show a host tag group | GET | `/objects/host_tag_group/{name}` |  |
| Host tag groups | GET Show all host tag groups | GET | `/domain-types/host_tag_group/collections/all` |  |
| Host tag groups | POST Create a host tag group | POST | `/domain-types/host_tag_group/collections/all` |  |
| Host tag groups | PUT Update a host tag group | PUT | `/objects/host_tag_group/{name}` |  |
| Hosts | DELETE Delete a host | DELETE | `/objects/host_config/{host_name}` |  |
| Hosts | GET Show a host | GET | `/objects/host_config/{host_name}` |  |
| Hosts | GET Show all hosts | GET | `/domain-types/host_config/collections/all` |  |
| Hosts | GET Wait for renaming process completion | GET | `/domain-types/host_config/actions/wait-for-completion/invoke` |  |
| Hosts | POST Bulk create hosts | POST | `/domain-types/host_config/actions/bulk-create/invoke` |  |
| Hosts | POST Bulk delete hosts | POST | `/domain-types/host_config/actions/bulk-delete/invoke` |  |
| Hosts | POST Create a cluster host | POST | `/domain-types/host_config/collections/clusters` |  |
| Hosts | POST Create a host | POST | `/domain-types/host_config/collections/all` |  |
| Hosts | POST Move a host to another folder | POST | `/objects/host_config/{host_name}/actions/move/invoke` |  |
| Hosts | PUT Bulk update hosts | PUT | `/domain-types/host_config/actions/bulk-update/invoke` |  |
| Hosts | PUT Rename a host | PUT | `/objects/host_config/{host_name}/actions/rename/invoke` |  |
| Hosts | PUT Update a host | PUT | `/objects/host_config/{host_name}` |  |
| Hosts | PUT Update the nodes of a cluster host | PUT | `/objects/host_config/{host_name}/properties/nodes` |  |
| Hosts (internal) | GET Show a host | GET | `/objects/host_config_internal/{host_name}` |  |
| Hosts (internal) | PUT Link a host to a UUID | PUT | `/objects/host_config_internal/{host_name}/actions/link_uuid/invoke` |  |
| Hosts (internal) | PUT Register an existing host, ie. link it to a UUID | PUT | `/objects/host_config_internal/{host_name}/actions/register/invoke` |  |
| LDAP Connections | DELETE Delete an LDAP connection | DELETE | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | GET Show all LDAP connections | GET | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | GET Show an LDAP connection | GET | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | POST Create an LDAP connection | POST | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | PUT Update an ldap connection | PUT | `/objects/ldap_connection/{ldap_connection_id}` |  |
| Metrics | POST Get metrics | POST | `/domain-types/metric/actions/get/invoke` |  |
| Miscellaneous | GET Display some version information | GET | `/version` |  |
| Notification Rules | GET Show a notification rule | GET | `/objects/notification_rule/{rule_id}` |  |
| Notification Rules | GET Show all notification rules | GET | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | POST Create a notification rule | POST | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | POST Delete a notification rule | POST | `/objects/notification_rule/{rule_id}/actions/delete/invoke` |  |
| Notification Rules | PUT Update a notification rule | PUT | `/objects/notification_rule/{rule_id}` |  |
| Parent scan | POST Start the parent scan background job | POST | `/domain-types/parent_scan/actions/start/invoke` |  |
| Passwords | DELETE Delete a password | DELETE | `/objects/password/{name}` |  |
| Passwords | GET Show all passwords | GET | `/domain-types/password/collections/all` |  |
| Passwords | GET Show password store entry | GET | `/objects/password/{name}` |  |
| Passwords | POST Create a password | POST | `/domain-types/password/collections/all` |  |
| Passwords | PUT Update a password | PUT | `/objects/password/{name}` |  |
| Quick setup | GET Fetch the Quick action background job result | GET | `/objects/quick_setup_action_result/{job_id}` |  |
| Quick setup | GET Fetch the Quick setup stage action background job result | GET | `/objects/quick_setup_stage_action_result/{job_id}` |  |
| Quick setup | GET Get a Quick setup stage structure | GET | `/objects/quick_setup/{quick_setup_id}/quick_setup_stage/{stage_index}` |  |
| Quick setup | GET Get guided stages or overview stages | GET | `/objects/quick_setup/{quick_setup_id}` |  |
| Quick setup | POST Run a quick setup action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-action/invoke` |  |
| Quick setup | POST Run a Quick setup stage validation and recap action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-stage-action/invoke` |  |
| Quick setup | PUT Edit the quick setup | PUT | `/objects/quick_setup/{quick_setup_id}/actions/edit/invoke` |  |
| Rules | DELETE Delete a rule | DELETE | `/objects/rule/{rule_id}` |  |
| Rules | GET List rules | GET | `/domain-types/rule/collections/all` |  |
| Rules | GET Show a rule | GET | `/objects/rule/{rule_id}` |  |
| Rules | POST Create rule | POST | `/domain-types/rule/collections/all` |  |
| Rules | POST Move a rule to a specific location | POST | `/objects/rule/{rule_id}/actions/move/invoke` |  |
| Rules | PUT Modify a rule | PUT | `/objects/rule/{rule_id}` |  |
| Rulesets | GET Search rule sets | GET | `/domain-types/ruleset/collections/all` |  |
| Rulesets | GET Show a ruleset | GET | `/objects/ruleset/{ruleset_name}` |  |
| Service discovery | GET Show the current service discovery result | GET | `/objects/service_discovery/{host_name}` |  |
| Service discovery | GET Show the last service discovery background job on a host | GET | `/objects/service_discovery_run/{host_name}` |  |
| Service discovery | GET Wait for service discovery completion | GET | `/objects/service_discovery_run/{host_name}/actions/wait-for-completion/invoke` |  |
| Service discovery | POST Execute a service discovery on a host | POST | `/domain-types/service_discovery_run/actions/start/invoke` |  |
| Service discovery | POST Start a bulk discovery job | POST | `/domain-types/discovery_run/actions/bulk-discovery-start/invoke` |  |
| Service discovery | PUT Update the phase of a service | PUT | `/objects/host/{host_name}/actions/update_discovery_phase/invoke` |  |
| Service groups | DELETE Delete a service group | DELETE | `/objects/service_group_config/{name}` |  |
| Service groups | GET Show a service group | GET | `/objects/service_group_config/{name}` |  |
| Service groups | GET Show all service groups | GET | `/domain-types/service_group_config/collections/all` |  |
| Service groups | POST Bulk create service groups | POST | `/domain-types/service_group_config/actions/bulk-create/invoke` |  |
| Service groups | POST Bulk delete service groups | POST | `/domain-types/service_group_config/actions/bulk-delete/invoke` |  |
| Service groups | POST Create a service group | POST | `/domain-types/service_group_config/collections/all` |  |
| Service groups | PUT Bulk update service groups | PUT | `/domain-types/service_group_config/actions/bulk-update/invoke` |  |
| Service groups | PUT Update a service group | PUT | `/objects/service_group_config/{name}` |  |
| Service status | GET Show a single service of a specific host | GET | `/objects/host/{host_name}/actions/show_service/invoke` |  |
| Service status | GET Show all monitored services (deprecated) | GET | `/domain-types/service/collections/all` | deprecated |
| Service status | GET Show the monitored services of a host (deprecated) | GET | `/objects/host/{host_name}/collections/services` | deprecated |
| Service status | POST Show all monitored services | POST | `/domain-types/service/collections/all` |  |
| Service status | POST Show the monitored services of a host | POST | `/objects/host/{host_name}/collections/services` |  |
| Site Management | GET Show a site connection | GET | `/objects/site_connection/{site_id}` |  |
| Site Management | GET Show all site connections | GET | `/domain-types/site_connection/collections/all` |  |
| Site Management | POST Create a site connection | POST | `/domain-types/site_connection/collections/all` |  |
| Site Management | POST Delete a site connection | POST | `/objects/site_connection/{site_id}/actions/delete/invoke` |  |
| Site Management | POST Login to a remote site | POST | `/objects/site_connection/{site_id}/actions/login/invoke` |  |
| Site Management | POST Logout from a remote site | POST | `/objects/site_connection/{site_id}/actions/logout/invoke` |  |
| Site Management | PUT Update a site connection | PUT | `/objects/site_connection/{site_id}` |  |
| Time periods | DELETE Delete a time period | DELETE | `/objects/time_period/{name}` |  |
| Time periods | GET Show a time period | GET | `/objects/time_period/{name}` |  |
| Time periods | GET Show all time periods | GET | `/domain-types/time_period/collections/all` |  |
| Time periods | POST Create a time period | POST | `/domain-types/time_period/collections/all` |  |
| Time periods | PUT Update a time period | PUT | `/objects/time_period/{name}` |  |
| User Roles | DELETE Delete a user role | DELETE | `/objects/user_role/{role_id}` |  |
| User Roles | GET Show a user role | GET | `/objects/user_role/{role_id}` |  |
| User Roles | GET Show all user roles | GET | `/domain-types/user_role/collections/all` |  |
| User Roles | POST Create/clone a user role | POST | `/domain-types/user_role/collections/all` |  |
| User Roles | PUT Edit a user role | PUT | `/objects/user_role/{role_id}` |  |
| Users | DELETE Delete a user | DELETE | `/objects/user_config/{username}` |  |
| Users | GET Show a user | GET | `/objects/user_config/{username}` |  |
| Users | GET Show all users | GET | `/domain-types/user_config/collections/all` |  |
| Users | POST Create a user | POST | `/domain-types/user_config/collections/all` |  |
| Users | POST Save a warning dismissal for the current user. | POST | `/domain-types/user_config/actions/dismiss-warning/invoke` |  |
| Users | PUT Edit a user | PUT | `/objects/user_config/{username}` |  |
