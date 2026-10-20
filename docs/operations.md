# Generated operations

Generated from the Checkmk REST API 1.0 OpenAPI document by `npm run generate`. Do not edit by hand.

- Operations: 189
- Resources: 40

| Resource | Operation | Method | Path | Notes |
| --- | --- | --- | --- | --- |
| Acknowledge Problems | Remove Acknowledgement | POST | `/domain-types/acknowledge/actions/delete/invoke` |  |
| Acknowledge Problems | Set Acknowledgement on Related Hosts | POST | `/domain-types/acknowledge/collections/host` |  |
| Acknowledge Problems | Set Acknowledgement on Related Services | POST | `/domain-types/acknowledge/collections/service` |  |
| Activate Changes | Activate | POST | `/domain-types/activation_run/actions/activate-changes/invoke` |  |
| Activate Changes | Get Activation Status | GET | `/objects/activation_run/{activation_id}` |  |
| Activate Changes | Get Many | GET | `/domain-types/activation_run/collections/pending_changes` |  |
| Activate Changes | Get Many Currently Running Activations | GET | `/domain-types/activation_run/collections/running` |  |
| Activate Changes | Wait for Activation Completion | GET | `/objects/activation_run/{activation_id}/actions/wait-for-completion/invoke` |  |
| Agents | Download Agents Shipped with Checkmk | GET | `/domain-types/agent/actions/download/invoke` |  |
| Audit Logs | Get Many | GET | `/domain-types/audit_log/collections/all` |  |
| Audit Logs | Move Audit Log Entries to Archive | POST | `/domain-types/audit_log/actions/archive/invoke` |  |
| Autocomplete (internal) | Call Autocompleter Specified in URL | POST | `/objects/autocomplete/{autocomplete_id}` |  |
| Aux Tags | Create | POST | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | Delete | POST | `/objects/aux_tag/{aux_tag_id}/actions/delete/invoke` |  |
| Aux Tags | Get | GET | `/objects/aux_tag/{aux_tag_id}` |  |
| Aux Tags | Get Many | GET | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | Update | PUT | `/objects/aux_tag/{aux_tag_id}` |  |
| Background Jobs | Get Last Status | GET | `/objects/background_job/{job_id}` |  |
| Broker Connection | Create | POST | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | Delete | DELETE | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | Get | GET | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | Get Many | GET | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | Update | PUT | `/objects/broker_connection/{connection_id}` |  |
| Business Intelligence (BI) | Create BI Aggregation | POST | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business Intelligence (BI) | Create New BI Pack | POST | `/objects/bi_pack/{pack_id}` |  |
| Business Intelligence (BI) | Create New BI Rule | POST | `/objects/bi_rule/{rule_id}` |  |
| Business Intelligence (BI) | Delete BI Aggregation | DELETE | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business Intelligence (BI) | Delete BI Pack | DELETE | `/objects/bi_pack/{pack_id}` |  |
| Business Intelligence (BI) | Delete BI Rule | DELETE | `/objects/bi_rule/{rule_id}` |  |
| Business Intelligence (BI) | Get BI Aggregation | GET | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business Intelligence (BI) | Get BI Pack and Its Rules and Aggregations | GET | `/objects/bi_pack/{pack_id}` |  |
| Business Intelligence (BI) | Get BI Rule | GET | `/objects/bi_rule/{rule_id}` |  |
| Business Intelligence (BI) | Get Many BI Packs | GET | `/domain-types/bi_pack/collections/all` |  |
| Business Intelligence (BI) | Get State of BI Aggregations (GET) | GET | `/domain-types/bi_aggregation/actions/aggregation_state/invoke` |  |
| Business Intelligence (BI) | Get State of BI Aggregations (POST) | POST | `/domain-types/bi_aggregation/actions/aggregation_state/invoke` |  |
| Business Intelligence (BI) | Update Existing BI Aggregation | PUT | `/objects/bi_aggregation/{aggregation_id}` |  |
| Business Intelligence (BI) | Update Existing BI Pack | PUT | `/objects/bi_pack/{pack_id}` |  |
| Business Intelligence (BI) | Update Existing BI Rule | PUT | `/objects/bi_rule/{rule_id}` |  |
| Certificates | Get Agent Controller Certificate Settings | GET | `/agent_controller_certificates_settings` |  |
| Certificates | X.509 PEM-encoded Certificate Signing Requests (CSRs) | POST | `/csr` |  |
| Certificates | X.509 PEM-encoded Root Certificate | GET | `/root_cert` |  |
| Comments | Create Host | POST | `/domain-types/comment/collections/host` |  |
| Comments | Create Service | POST | `/domain-types/comment/collections/service` |  |
| Comments | Delete | POST | `/domain-types/comment/actions/delete/invoke` |  |
| Comments | Get | GET | `/objects/comment/{comment_id}` |  |
| Comments | Get Many | GET | `/domain-types/comment/collections/{collection_name}` |  |
| Configuration Entities | Create | POST | `/domain-types/configuration_entity/collections/all` |  |
| Configuration Entities | Get Configuration Entity Form Spec Schema | GET | `/domain-types/form_spec/collections/{entity_type}` |  |
| Configuration Entities | Update | PUT | `/domain-types/configuration_entity/actions/edit-single-entity/invoke` |  |
| Configuration Entities / Folder | List | GET | `/domain-types/folder/collections/{entity_type_specifier}` |  |
| Configuration Entities / Notification Parameter | Get | GET | `/objects/notification_parameter/{entity_id}` |  |
| Configuration Entities / Notification Parameter | List | GET | `/domain-types/notification_parameter/collections/{entity_type_specifier}` |  |
| Configuration Entities / Passwordstore Password | List | GET | `/domain-types/passwordstore_password/collections/{entity_type_specifier}` |  |
| Contact Groups | Bulk Create | POST | `/domain-types/contact_group_config/actions/bulk-create/invoke` |  |
| Contact Groups | Bulk Delete | POST | `/domain-types/contact_group_config/actions/bulk-delete/invoke` |  |
| Contact Groups | Bulk Update | PUT | `/domain-types/contact_group_config/actions/bulk-update/invoke` |  |
| Contact Groups | Create | POST | `/domain-types/contact_group_config/collections/all` |  |
| Contact Groups | Delete | DELETE | `/objects/contact_group_config/{name}` |  |
| Contact Groups | Get | GET | `/objects/contact_group_config/{name}` |  |
| Contact Groups | Get Many | GET | `/domain-types/contact_group_config/collections/all` |  |
| Contact Groups | Update | PUT | `/objects/contact_group_config/{name}` |  |
| Downtimes | Create Host | POST | `/domain-types/downtime/collections/host` |  |
| Downtimes | Create Service | POST | `/domain-types/downtime/collections/service` |  |
| Downtimes | Delete | POST | `/domain-types/downtime/actions/delete/invoke` |  |
| Downtimes | Get | GET | `/objects/downtime/{downtime_id}` |  |
| Downtimes | Get Many | GET | `/domain-types/downtime/collections/all` |  |
| Downtimes | Update | PUT | `/domain-types/downtime/actions/modify/invoke` |  |
| Event Console | Archive | POST | `/domain-types/event_console/actions/delete/invoke` |  |
| Event Console | Change Event State | POST | `/objects/event_console/{event_id}/actions/change_state/invoke` |  |
| Event Console | Change Multiple Event States | POST | `/domain-types/event_console/actions/change_state/invoke` |  |
| Event Console | Get | GET | `/objects/event_console/{event_id}` |  |
| Event Console | Get Many | GET | `/domain-types/event_console/collections/all` |  |
| Event Console | Update and Acknowledge Event | POST | `/objects/event_console/{event_id}/actions/update_and_acknowledge/invoke` |  |
| Event Console | Update and Acknowledge Events | POST | `/domain-types/event_console/actions/update_and_acknowledge/invoke` |  |
| Folders | Bulk Update | PUT | `/domain-types/folder_config/actions/bulk-update/invoke` |  |
| Folders | Create | POST | `/domain-types/folder_config/collections/all` |  |
| Folders | Delete | DELETE | `/objects/folder_config/{folder}` |  |
| Folders | Get | GET | `/objects/folder_config/{folder}` |  |
| Folders | Get Many | GET | `/domain-types/folder_config/collections/all` |  |
| Folders | Get Many Hosts | GET | `/objects/folder_config/{folder}/collections/hosts` |  |
| Folders | Move | POST | `/objects/folder_config/{folder}/actions/move/invoke` |  |
| Folders | Update | PUT | `/objects/folder_config/{folder}` |  |
| Host Groups | Bulk Create | POST | `/domain-types/host_group_config/actions/bulk-create/invoke` |  |
| Host Groups | Bulk Delete | POST | `/domain-types/host_group_config/actions/bulk-delete/invoke` |  |
| Host Groups | Bulk Update | PUT | `/domain-types/host_group_config/actions/bulk-update/invoke` |  |
| Host Groups | Create | POST | `/domain-types/host_group_config/collections/all` |  |
| Host Groups | Delete | DELETE | `/objects/host_group_config/{name}` |  |
| Host Groups | Get | GET | `/objects/host_group_config/{name}` |  |
| Host Groups | Get Many | GET | `/domain-types/host_group_config/collections/all` |  |
| Host Groups | Update | PUT | `/objects/host_group_config/{name}` |  |
| Host Status | Get | GET | `/objects/host/{host_name}` |  |
| Host Status | Get Hosts of Specific Condition | POST | `/domain-types/host/collections/all` |  |
| Host Status | Get Hosts of Specific Condition (deprecated) | GET | `/domain-types/host/collections/all` | deprecated |
| Host Tag Groups | Create | POST | `/domain-types/host_tag_group/collections/all` |  |
| Host Tag Groups | Delete | DELETE | `/objects/host_tag_group/{name}` |  |
| Host Tag Groups | Get | GET | `/objects/host_tag_group/{name}` |  |
| Host Tag Groups | Get Many | GET | `/domain-types/host_tag_group/collections/all` |  |
| Host Tag Groups | Update | PUT | `/objects/host_tag_group/{name}` |  |
| Hosts | Bulk Create | POST | `/domain-types/host_config/actions/bulk-create/invoke` |  |
| Hosts | Bulk Delete | POST | `/domain-types/host_config/actions/bulk-delete/invoke` |  |
| Hosts | Bulk Update | PUT | `/domain-types/host_config/actions/bulk-update/invoke` |  |
| Hosts | Create | POST | `/domain-types/host_config/collections/all` |  |
| Hosts | Create Cluster | POST | `/domain-types/host_config/collections/clusters` |  |
| Hosts | Delete | DELETE | `/objects/host_config/{host_name}` |  |
| Hosts | Get | GET | `/objects/host_config/{host_name}` |  |
| Hosts | Get Many | GET | `/domain-types/host_config/collections/all` |  |
| Hosts | Move Host to Another Folder | POST | `/objects/host_config/{host_name}/actions/move/invoke` |  |
| Hosts | Rename | PUT | `/objects/host_config/{host_name}/actions/rename/invoke` |  |
| Hosts | Update | PUT | `/objects/host_config/{host_name}` |  |
| Hosts | Update Nodes of Cluster | PUT | `/objects/host_config/{host_name}/properties/nodes` |  |
| Hosts | Wait for Renaming Process Completion | GET | `/domain-types/host_config/actions/wait-for-completion/invoke` |  |
| Hosts (internal) | Get | GET | `/objects/host_config_internal/{host_name}` |  |
| Hosts (internal) | Link Host to UUID | PUT | `/objects/host_config_internal/{host_name}/actions/link_uuid/invoke` |  |
| Hosts (internal) | Register Existing Host, Ie. Link It to UUID | PUT | `/objects/host_config_internal/{host_name}/actions/register/invoke` |  |
| LDAP Connections | Create | POST | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | Delete | DELETE | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | Get | GET | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | Get Many | GET | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | Update | PUT | `/objects/ldap_connection/{ldap_connection_id}` |  |
| Metrics | Get | POST | `/domain-types/metric/actions/get/invoke` |  |
| Miscellaneous | Display Some Version Information | GET | `/version` |  |
| Notification Rules | Create | POST | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | Delete | POST | `/objects/notification_rule/{rule_id}/actions/delete/invoke` |  |
| Notification Rules | Get | GET | `/objects/notification_rule/{rule_id}` |  |
| Notification Rules | Get Many | GET | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | Update | PUT | `/objects/notification_rule/{rule_id}` |  |
| Parent Scan | Start Parent Scan Background Job | POST | `/domain-types/parent_scan/actions/start/invoke` |  |
| Passwords | Create | POST | `/domain-types/password/collections/all` |  |
| Passwords | Delete | DELETE | `/objects/password/{name}` |  |
| Passwords | Get Many | GET | `/domain-types/password/collections/all` |  |
| Passwords | Get Password Store Entry | GET | `/objects/password/{name}` |  |
| Passwords | Update | PUT | `/objects/password/{name}` |  |
| Quick Setup | Fetch Quick Action Background Job Result | GET | `/objects/quick_setup_action_result/{job_id}` |  |
| Quick Setup | Fetch Quick Setup Stage Action Background Job Result | GET | `/objects/quick_setup_stage_action_result/{job_id}` |  |
| Quick Setup | Get Guided Stages or Overview Stages | GET | `/objects/quick_setup/{quick_setup_id}` |  |
| Quick Setup | Get Quick Setup Stage Structure | GET | `/objects/quick_setup/{quick_setup_id}/quick_setup_stage/{stage_index}` |  |
| Quick Setup | Run Quick Setup Action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-action/invoke` |  |
| Quick Setup | Run Quick Setup Stage Validation and Recap Action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-stage-action/invoke` |  |
| Quick Setup | Update Quick Setup | PUT | `/objects/quick_setup/{quick_setup_id}/actions/edit/invoke` |  |
| Rules | Create | POST | `/domain-types/rule/collections/all` |  |
| Rules | Delete | DELETE | `/objects/rule/{rule_id}` |  |
| Rules | Get | GET | `/objects/rule/{rule_id}` |  |
| Rules | List | GET | `/domain-types/rule/collections/all` |  |
| Rules | Move Rule to Specific Location | POST | `/objects/rule/{rule_id}/actions/move/invoke` |  |
| Rules | Update | PUT | `/objects/rule/{rule_id}` |  |
| Rulesets | Get | GET | `/objects/ruleset/{ruleset_name}` |  |
| Rulesets | Search | GET | `/domain-types/ruleset/collections/all` |  |
| Service Discovery | Execute Service Discovery on Host | POST | `/domain-types/service_discovery_run/actions/start/invoke` |  |
| Service Discovery | Get Current Service Discovery Result | GET | `/objects/service_discovery/{host_name}` |  |
| Service Discovery | Get Last Service Discovery Background Job on Host | GET | `/objects/service_discovery_run/{host_name}` |  |
| Service Discovery | Start Bulk Discovery Job | POST | `/domain-types/discovery_run/actions/bulk-discovery-start/invoke` |  |
| Service Discovery | Update Phase of Service | PUT | `/objects/host/{host_name}/actions/update_discovery_phase/invoke` |  |
| Service Discovery | Wait for Service Discovery Completion | GET | `/objects/service_discovery_run/{host_name}/actions/wait-for-completion/invoke` |  |
| Service Groups | Bulk Create | POST | `/domain-types/service_group_config/actions/bulk-create/invoke` |  |
| Service Groups | Bulk Delete | POST | `/domain-types/service_group_config/actions/bulk-delete/invoke` |  |
| Service Groups | Bulk Update | PUT | `/domain-types/service_group_config/actions/bulk-update/invoke` |  |
| Service Groups | Create | POST | `/domain-types/service_group_config/collections/all` |  |
| Service Groups | Delete | DELETE | `/objects/service_group_config/{name}` |  |
| Service Groups | Get | GET | `/objects/service_group_config/{name}` |  |
| Service Groups | Get Many | GET | `/domain-types/service_group_config/collections/all` |  |
| Service Groups | Update | PUT | `/objects/service_group_config/{name}` |  |
| Service Status | Get Many | POST | `/domain-types/service/collections/all` |  |
| Service Status | Get Many (deprecated) | GET | `/domain-types/service/collections/all` | deprecated |
| Service Status | Get Monitored Services of Host | POST | `/objects/host/{host_name}/collections/services` |  |
| Service Status | Get Monitored Services of Host (deprecated) | GET | `/objects/host/{host_name}/collections/services` | deprecated |
| Service Status | Get Single Service of Specific Host | GET | `/objects/host/{host_name}/actions/show_service/invoke` |  |
| Site Management | Create | POST | `/domain-types/site_connection/collections/all` |  |
| Site Management | Delete | POST | `/objects/site_connection/{site_id}/actions/delete/invoke` |  |
| Site Management | Get | GET | `/objects/site_connection/{site_id}` |  |
| Site Management | Get Many | GET | `/domain-types/site_connection/collections/all` |  |
| Site Management | Log in to Remote Site | POST | `/objects/site_connection/{site_id}/actions/login/invoke` |  |
| Site Management | Log Out from Remote Site | POST | `/objects/site_connection/{site_id}/actions/logout/invoke` |  |
| Site Management | Update | PUT | `/objects/site_connection/{site_id}` |  |
| Time Periods | Create | POST | `/domain-types/time_period/collections/all` |  |
| Time Periods | Delete | DELETE | `/objects/time_period/{name}` |  |
| Time Periods | Get | GET | `/objects/time_period/{name}` |  |
| Time Periods | Get Many | GET | `/domain-types/time_period/collections/all` |  |
| Time Periods | Update | PUT | `/objects/time_period/{name}` |  |
| User Roles | Create | POST | `/domain-types/user_role/collections/all` |  |
| User Roles | Delete | DELETE | `/objects/user_role/{role_id}` |  |
| User Roles | Get | GET | `/objects/user_role/{role_id}` |  |
| User Roles | Get Many | GET | `/domain-types/user_role/collections/all` |  |
| User Roles | Update | PUT | `/objects/user_role/{role_id}` |  |
| Users | Create | POST | `/domain-types/user_config/collections/all` |  |
| Users | Delete | DELETE | `/objects/user_config/{username}` |  |
| Users | Get | GET | `/objects/user_config/{username}` |  |
| Users | Get Many | GET | `/domain-types/user_config/collections/all` |  |
| Users | Save Warning Dismissal for Current User | POST | `/domain-types/user_config/actions/dismiss-warning/invoke` |  |
| Users | Update | PUT | `/objects/user_config/{username}` |  |
