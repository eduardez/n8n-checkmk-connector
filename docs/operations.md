# Generated operations

Generated from the Checkmk REST API 1.0 OpenAPI document by `npm run generate`. Do not edit by hand.

- Operations: 189
- Resources: 40

| Resource | Operation | Method | Path | Notes |
| --- | --- | --- | --- | --- |
| Acknowledge Problems | Remove Acknowledgement on Host or Service Problems | POST | `/domain-types/acknowledge/actions/delete/invoke` |  |
| Acknowledge Problems | Set Acknowledgement on Related Hosts | POST | `/domain-types/acknowledge/collections/host` |  |
| Acknowledge Problems | Set Acknowledgement on Related Services | POST | `/domain-types/acknowledge/collections/service` |  |
| Activate Changes | Activate Pending Changes | POST | `/domain-types/activation_run/actions/activate-changes/invoke` |  |
| Activate Changes | Get Activation Status | GET | `/objects/activation_run/{activation_id}` |  |
| Activate Changes | Get Many Currently Running Activations | GET | `/domain-types/activation_run/collections/running` |  |
| Activate Changes | Get Many Pending Changes | GET | `/domain-types/activation_run/collections/pending_changes` |  |
| Activate Changes | Wait for Activation Completion | GET | `/objects/activation_run/{activation_id}/actions/wait-for-completion/invoke` |  |
| Agents | Download Agents Shipped with Checkmk | GET | `/domain-types/agent/actions/download/invoke` |  |
| Audit Logs | Get Many Audit Log Entries | GET | `/domain-types/audit_log/collections/all` |  |
| Audit Logs | Move Audit Log Entries to Archive | POST | `/domain-types/audit_log/actions/archive/invoke` |  |
| Autocomplete (internal) | Call Autocompleter Specified in URL | POST | `/objects/autocomplete/{autocomplete_id}` |  |
| Aux Tags | Create Auxiliary Tag | POST | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | Delete Auxiliary Tag | POST | `/objects/aux_tag/{aux_tag_id}/actions/delete/invoke` |  |
| Aux Tags | Get Auxiliary Tag | GET | `/objects/aux_tag/{aux_tag_id}` |  |
| Aux Tags | Get Auxiliary Tags | GET | `/domain-types/aux_tag/collections/all` |  |
| Aux Tags | Update Aux Tag | PUT | `/objects/aux_tag/{aux_tag_id}` |  |
| Background Jobs | Get Last Status of Background Job | GET | `/objects/background_job/{job_id}` |  |
| Broker Connection | Create Peer to Peer Broker Connection | POST | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | Delete Peer to Peer Broker Connection | DELETE | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | Get Many Peer to Peer Broker Connections | GET | `/domain-types/broker_connection/collections/all` |  |
| Broker Connection | Get Peer to Peer Broker Connection | GET | `/objects/broker_connection/{connection_id}` |  |
| Broker Connection | Update Peer to Peer Broker Connection | PUT | `/objects/broker_connection/{connection_id}` |  |
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
| Comments | Create Host Comment | POST | `/domain-types/comment/collections/host` |  |
| Comments | Create Service Comment | POST | `/domain-types/comment/collections/service` |  |
| Comments | Delete Comments | POST | `/domain-types/comment/actions/delete/invoke` |  |
| Comments | Get Comment | GET | `/objects/comment/{comment_id}` |  |
| Comments | Get Comments | GET | `/domain-types/comment/collections/{collection_name}` |  |
| Configuration Entities | Create Configuration Entity | POST | `/domain-types/configuration_entity/collections/all` |  |
| Configuration Entities | Get Configuration Entity Form Spec Schema | GET | `/domain-types/form_spec/collections/{entity_type}` |  |
| Configuration Entities | Update Existing Configuration Entity | PUT | `/domain-types/configuration_entity/actions/edit-single-entity/invoke` |  |
| Configuration Entities / Folder | List Folder | GET | `/domain-types/folder/collections/{entity_type_specifier}` |  |
| Configuration Entities / Notification Parameter | Get Notification Parameter | GET | `/objects/notification_parameter/{entity_id}` |  |
| Configuration Entities / Notification Parameter | List Notification Parameters | GET | `/domain-types/notification_parameter/collections/{entity_type_specifier}` |  |
| Configuration Entities / Passwordstore Password | List Passwordstore Passwords | GET | `/domain-types/passwordstore_password/collections/{entity_type_specifier}` |  |
| Contact Groups | Bulk Create Contact Groups | POST | `/domain-types/contact_group_config/actions/bulk-create/invoke` |  |
| Contact Groups | Bulk Delete Contact Groups | POST | `/domain-types/contact_group_config/actions/bulk-delete/invoke` |  |
| Contact Groups | Bulk Update Contact Groups | PUT | `/domain-types/contact_group_config/actions/bulk-update/invoke` |  |
| Contact Groups | Create Contact Group | POST | `/domain-types/contact_group_config/collections/all` |  |
| Contact Groups | Delete Contact Group | DELETE | `/objects/contact_group_config/{name}` |  |
| Contact Groups | Get Contact Group | GET | `/objects/contact_group_config/{name}` |  |
| Contact Groups | Get Many Contact Groups | GET | `/domain-types/contact_group_config/collections/all` |  |
| Contact Groups | Update Contact Group | PUT | `/objects/contact_group_config/{name}` |  |
| Downtimes | Create Host Related Scheduled Downtime | POST | `/domain-types/downtime/collections/host` |  |
| Downtimes | Create Service Related Scheduled Downtime | POST | `/domain-types/downtime/collections/service` |  |
| Downtimes | Delete Scheduled Downtime | POST | `/domain-types/downtime/actions/delete/invoke` |  |
| Downtimes | Get Downtime | GET | `/objects/downtime/{downtime_id}` |  |
| Downtimes | Get Many Scheduled Downtimes | GET | `/domain-types/downtime/collections/all` |  |
| Downtimes | Update Scheduled Downtime | PUT | `/domain-types/downtime/actions/modify/invoke` |  |
| Event Console | Archive Events | POST | `/domain-types/event_console/actions/delete/invoke` |  |
| Event Console | Change Event State | POST | `/objects/event_console/{event_id}/actions/change_state/invoke` |  |
| Event Console | Change Multiple Event States | POST | `/domain-types/event_console/actions/change_state/invoke` |  |
| Event Console | Get Event | GET | `/objects/event_console/{event_id}` |  |
| Event Console | Get Events | GET | `/domain-types/event_console/collections/all` |  |
| Event Console | Update and Acknowledge Event | POST | `/objects/event_console/{event_id}/actions/update_and_acknowledge/invoke` |  |
| Event Console | Update and Acknowledge Events | POST | `/domain-types/event_console/actions/update_and_acknowledge/invoke` |  |
| Folders | Bulk Update Folders | PUT | `/domain-types/folder_config/actions/bulk-update/invoke` |  |
| Folders | Create Folder | POST | `/domain-types/folder_config/collections/all` |  |
| Folders | Delete Folder | DELETE | `/objects/folder_config/{folder}` |  |
| Folders | Get Folder | GET | `/objects/folder_config/{folder}` |  |
| Folders | Get Many Folders | GET | `/domain-types/folder_config/collections/all` |  |
| Folders | Get Many Hosts in Folder | GET | `/objects/folder_config/{folder}/collections/hosts` |  |
| Folders | Move Folder | POST | `/objects/folder_config/{folder}/actions/move/invoke` |  |
| Folders | Update Folder | PUT | `/objects/folder_config/{folder}` |  |
| Host Groups | Bulk Create Host Groups | POST | `/domain-types/host_group_config/actions/bulk-create/invoke` |  |
| Host Groups | Bulk Delete Host Groups | POST | `/domain-types/host_group_config/actions/bulk-delete/invoke` |  |
| Host Groups | Bulk Update Host Groups | PUT | `/domain-types/host_group_config/actions/bulk-update/invoke` |  |
| Host Groups | Create Host Group | POST | `/domain-types/host_group_config/collections/all` |  |
| Host Groups | Delete Host Group | DELETE | `/objects/host_group_config/{name}` |  |
| Host Groups | Get Host Group | GET | `/objects/host_group_config/{name}` |  |
| Host Groups | Get Many Host Groups | GET | `/domain-types/host_group_config/collections/all` |  |
| Host Groups | Update Host Group | PUT | `/objects/host_group_config/{name}` |  |
| Host Status | Get Host | GET | `/objects/host/{host_name}` |  |
| Host Status | Get Hosts of Specific Condition | POST | `/domain-types/host/collections/all` |  |
| Host Status | Get Hosts of Specific Condition (deprecated) | GET | `/domain-types/host/collections/all` | deprecated |
| Host Tag Groups | Create Host Tag Group | POST | `/domain-types/host_tag_group/collections/all` |  |
| Host Tag Groups | Delete Host Tag Group | DELETE | `/objects/host_tag_group/{name}` |  |
| Host Tag Groups | Get Host Tag Group | GET | `/objects/host_tag_group/{name}` |  |
| Host Tag Groups | Get Many Host Tag Groups | GET | `/domain-types/host_tag_group/collections/all` |  |
| Host Tag Groups | Update Host Tag Group | PUT | `/objects/host_tag_group/{name}` |  |
| Hosts | Bulk Create Hosts | POST | `/domain-types/host_config/actions/bulk-create/invoke` |  |
| Hosts | Bulk Delete Hosts | POST | `/domain-types/host_config/actions/bulk-delete/invoke` |  |
| Hosts | Bulk Update Hosts | PUT | `/domain-types/host_config/actions/bulk-update/invoke` |  |
| Hosts | Create Cluster Host | POST | `/domain-types/host_config/collections/clusters` |  |
| Hosts | Create Host | POST | `/domain-types/host_config/collections/all` |  |
| Hosts | Delete Host | DELETE | `/objects/host_config/{host_name}` |  |
| Hosts | Get Host | GET | `/objects/host_config/{host_name}` |  |
| Hosts | Get Many Hosts | GET | `/domain-types/host_config/collections/all` |  |
| Hosts | Move Host to Another Folder | POST | `/objects/host_config/{host_name}/actions/move/invoke` |  |
| Hosts | Rename Host | PUT | `/objects/host_config/{host_name}/actions/rename/invoke` |  |
| Hosts | Update Host | PUT | `/objects/host_config/{host_name}` |  |
| Hosts | Update Nodes of Cluster Host | PUT | `/objects/host_config/{host_name}/properties/nodes` |  |
| Hosts | Wait for Renaming Process Completion | GET | `/domain-types/host_config/actions/wait-for-completion/invoke` |  |
| Hosts (internal) | Get Host | GET | `/objects/host_config_internal/{host_name}` |  |
| Hosts (internal) | Link Host to UUID | PUT | `/objects/host_config_internal/{host_name}/actions/link_uuid/invoke` |  |
| Hosts (internal) | Register Existing Host, Ie. Link It to UUID | PUT | `/objects/host_config_internal/{host_name}/actions/register/invoke` |  |
| LDAP Connections | Create LDAP Connection | POST | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | Delete LDAP Connection | DELETE | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | Get LDAP Connection | GET | `/objects/ldap_connection/{ldap_connection_id}` |  |
| LDAP Connections | Get Many LDAP Connections | GET | `/domain-types/ldap_connection/collections/all` |  |
| LDAP Connections | Update LDAP Connection | PUT | `/objects/ldap_connection/{ldap_connection_id}` |  |
| Metrics | Get Metrics | POST | `/domain-types/metric/actions/get/invoke` |  |
| Miscellaneous | Display Some Version Information | GET | `/version` |  |
| Notification Rules | Create Notification Rule | POST | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | Delete Notification Rule | POST | `/objects/notification_rule/{rule_id}/actions/delete/invoke` |  |
| Notification Rules | Get Many Notification Rules | GET | `/domain-types/notification_rule/collections/all` |  |
| Notification Rules | Get Notification Rule | GET | `/objects/notification_rule/{rule_id}` |  |
| Notification Rules | Update Notification Rule | PUT | `/objects/notification_rule/{rule_id}` |  |
| Parent Scan | Start Parent Scan Background Job | POST | `/domain-types/parent_scan/actions/start/invoke` |  |
| Passwords | Create Password | POST | `/domain-types/password/collections/all` |  |
| Passwords | Delete Password | DELETE | `/objects/password/{name}` |  |
| Passwords | Get Many Passwords | GET | `/domain-types/password/collections/all` |  |
| Passwords | Get Password Store Entry | GET | `/objects/password/{name}` |  |
| Passwords | Update Password | PUT | `/objects/password/{name}` |  |
| Quick Setup | Fetch Quick Action Background Job Result | GET | `/objects/quick_setup_action_result/{job_id}` |  |
| Quick Setup | Fetch Quick Setup Stage Action Background Job Result | GET | `/objects/quick_setup_stage_action_result/{job_id}` |  |
| Quick Setup | Get Guided Stages or Overview Stages | GET | `/objects/quick_setup/{quick_setup_id}` |  |
| Quick Setup | Get Quick Setup Stage Structure | GET | `/objects/quick_setup/{quick_setup_id}/quick_setup_stage/{stage_index}` |  |
| Quick Setup | Run Quick Setup Action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-action/invoke` |  |
| Quick Setup | Run Quick Setup Stage Validation and Recap Action | POST | `/objects/quick_setup/{quick_setup_id}/actions/run-stage-action/invoke` |  |
| Quick Setup | Update Quick Setup | PUT | `/objects/quick_setup/{quick_setup_id}/actions/edit/invoke` |  |
| Rules | Create Rule | POST | `/domain-types/rule/collections/all` |  |
| Rules | Delete Rule | DELETE | `/objects/rule/{rule_id}` |  |
| Rules | Get Rule | GET | `/objects/rule/{rule_id}` |  |
| Rules | List Rules | GET | `/domain-types/rule/collections/all` |  |
| Rules | Move Rule to Specific Location | POST | `/objects/rule/{rule_id}/actions/move/invoke` |  |
| Rules | Update Rule | PUT | `/objects/rule/{rule_id}` |  |
| Rulesets | Get Ruleset | GET | `/objects/ruleset/{ruleset_name}` |  |
| Rulesets | Search Rule Sets | GET | `/domain-types/ruleset/collections/all` |  |
| Service Discovery | Execute Service Discovery on Host | POST | `/domain-types/service_discovery_run/actions/start/invoke` |  |
| Service Discovery | Get Current Service Discovery Result | GET | `/objects/service_discovery/{host_name}` |  |
| Service Discovery | Get Last Service Discovery Background Job on Host | GET | `/objects/service_discovery_run/{host_name}` |  |
| Service Discovery | Start Bulk Discovery Job | POST | `/domain-types/discovery_run/actions/bulk-discovery-start/invoke` |  |
| Service Discovery | Update Phase of Service | PUT | `/objects/host/{host_name}/actions/update_discovery_phase/invoke` |  |
| Service Discovery | Wait for Service Discovery Completion | GET | `/objects/service_discovery_run/{host_name}/actions/wait-for-completion/invoke` |  |
| Service Groups | Bulk Create Service Groups | POST | `/domain-types/service_group_config/actions/bulk-create/invoke` |  |
| Service Groups | Bulk Delete Service Groups | POST | `/domain-types/service_group_config/actions/bulk-delete/invoke` |  |
| Service Groups | Bulk Update Service Groups | PUT | `/domain-types/service_group_config/actions/bulk-update/invoke` |  |
| Service Groups | Create Service Group | POST | `/domain-types/service_group_config/collections/all` |  |
| Service Groups | Delete Service Group | DELETE | `/objects/service_group_config/{name}` |  |
| Service Groups | Get Many Service Groups | GET | `/domain-types/service_group_config/collections/all` |  |
| Service Groups | Get Service Group | GET | `/objects/service_group_config/{name}` |  |
| Service Groups | Update Service Group | PUT | `/objects/service_group_config/{name}` |  |
| Service Status | Get Many Monitored Services | POST | `/domain-types/service/collections/all` |  |
| Service Status | Get Many Monitored Services (deprecated) | GET | `/domain-types/service/collections/all` | deprecated |
| Service Status | Get Monitored Services of Host | POST | `/objects/host/{host_name}/collections/services` |  |
| Service Status | Get Monitored Services of Host (deprecated) | GET | `/objects/host/{host_name}/collections/services` | deprecated |
| Service Status | Get Single Service of Specific Host | GET | `/objects/host/{host_name}/actions/show_service/invoke` |  |
| Site Management | Create Site Connection | POST | `/domain-types/site_connection/collections/all` |  |
| Site Management | Delete Site Connection | POST | `/objects/site_connection/{site_id}/actions/delete/invoke` |  |
| Site Management | Get Many Site Connections | GET | `/domain-types/site_connection/collections/all` |  |
| Site Management | Get Site Connection | GET | `/objects/site_connection/{site_id}` |  |
| Site Management | Log in to Remote Site | POST | `/objects/site_connection/{site_id}/actions/login/invoke` |  |
| Site Management | Log Out from Remote Site | POST | `/objects/site_connection/{site_id}/actions/logout/invoke` |  |
| Site Management | Update Site Connection | PUT | `/objects/site_connection/{site_id}` |  |
| Time Periods | Create Time Period | POST | `/domain-types/time_period/collections/all` |  |
| Time Periods | Delete Time Period | DELETE | `/objects/time_period/{name}` |  |
| Time Periods | Get Many Time Periods | GET | `/domain-types/time_period/collections/all` |  |
| Time Periods | Get Time Period | GET | `/objects/time_period/{name}` |  |
| Time Periods | Update Time Period | PUT | `/objects/time_period/{name}` |  |
| User Roles | Create User Role | POST | `/domain-types/user_role/collections/all` |  |
| User Roles | Delete User Role | DELETE | `/objects/user_role/{role_id}` |  |
| User Roles | Get Many User Roles | GET | `/domain-types/user_role/collections/all` |  |
| User Roles | Get User Role | GET | `/objects/user_role/{role_id}` |  |
| User Roles | Update User Role | PUT | `/objects/user_role/{role_id}` |  |
| Users | Create User | POST | `/domain-types/user_config/collections/all` |  |
| Users | Delete User | DELETE | `/objects/user_config/{username}` |  |
| Users | Get Many Users | GET | `/domain-types/user_config/collections/all` |  |
| Users | Get User | GET | `/objects/user_config/{username}` |  |
| Users | Save Warning Dismissal for Current User | POST | `/domain-types/user_config/actions/dismiss-warning/invoke` |  |
| Users | Update User | PUT | `/objects/user_config/{username}` |  |
