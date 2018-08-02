/**
 * Defines a connection to a JDBC data source.
 *
 * @typedef {Object} JdbcDatasource
 * @property {string} [id] unique identifier for this data source
 * @property {string} name the name of this data source
 * @property {string} description a description of this data source
 * @property {Array} sourceForFeeds list of feeds using this data source
 * @property {string} type type name of this data source
 * @property {string} databaseConnectionUrl a database URL of the form jdbc:subprotocol:subname
 * @property {string} databaseDriverClassName database driver class name
 * @property {string} databaseDriverLocation comma-separated list of files/folders and/or URLs containing the driver JAR and its dependencies (if any)
 * @property {string} databaseUser database user name
 * @property {string} password password to use when connecting to this data source
 */
import * as _ from "underscore";
import { EntityAccessControlService } from '../shared/entity-access-control/EntityAccessControlService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  RestUrlService } from './RestUrlService';

/**
 * Interacts with the Data Sources REST API.
 * @constructor
 */
@Injectable()
 export  class DatasourcesService {
       /**
         * Type name for JDBC data sources.
         * @type {string}
         */
        JDBC_TYPE = "JdbcDatasource";

        /**
         * Type name for user data sources.
         * @type {string}
         */
        USER_TYPE = "UserDatasource";

        ICON = "grid_on";
        ICON_COLOR = "orange";
        HIVE_DATASOURCE = {id: 'HIVE', name: "Hive", isHive: true, icon: this.ICON, iconColor: this.ICON_COLOR};

        getHiveDatasource() {
                return this.HIVE_DATASOURCE;
            }
        ensureDefaultIcon(datasource:any) {
            if (datasource.icon === undefined) {
                datasource.icon = this.ICON;
                datasource.iconColor = this.ICON_COLOR;
            }
        }

        constructor(private http:HttpClient, 
                    private restUrlService:RestUrlService, 
                    private entityAccessControlService:EntityAccessControlService) {
            
        }     
        /**
             * Default icon name and color is used for data sources which  were created prior to
             * data sources supporting icons
             * @returns {string} default icon name
             */
            defaultIconName () {
                return this.ICON;
            }

            /**
             * Default icon name and color is used for data sources which  were created prior to
             * data sources supporting icons
             * @returns {string} default icon color
             */
            defaultIconColor () {
                return this.ICON_COLOR;
            }

            /**
             * Deletes the data source with the specified id.
             * @param {string} id the data source id
             * @returns {Promise} for when the data source is deleted
             */
            deleteById (id:any) {
                return this.http.delete(this.restUrlService.GET_DATASOURCES_URL + "/" + encodeURIComponent(id)).toPromise();
            }

            /**
             * Filters the specified array of data sources by matching ids.
             *
             * @param {string|Array.<string>} ids the list of ids
             * @param {Array.<JdbcDatasource>} array the data sources to filter
             * @return {Array.<JdbcDatasource>} the array of matching data sources
             */
            filterArrayByIds (ids:any, array:any) {
                var idList = Array.isArray(ids) ? ids : [ids];
                return array.filter((datasource:any) => {
                    return (idList.indexOf(datasource.id) > -1);
                });
            }

            /**
             * Finds all user data sources.
             * @returns {Promise} with the list of data sources
             */
            findAll () {
                return this.http.get(this.restUrlService.GET_DATASOURCES_URL, {params: {type: this.USER_TYPE}}).toPromise()
                    .then((response:any) => {
                        _.each(response, this.ensureDefaultIcon);
                        return response;
                    });
            }

            /**
             * Finds the data source with the specified id.
             * @param {string} id the data source id
             * @returns {Promise} with the data source
             */
            findById (id:any) {
                if (this.HIVE_DATASOURCE.id === id) {
                    return Promise.resolve(this.HIVE_DATASOURCE);
                }
                return this.http.get(this.restUrlService.GET_DATASOURCES_URL + "/" + id).toPromise()
                    .then((response:any) => {
                        this.ensureDefaultIcon(response);
                        return response;
                    });
            }

            findControllerServiceReferences (controllerServiceId:any) {
                return this.http.get(this.restUrlService.GET_NIFI_CONTROLLER_SERVICE_REFERENCES_URL(controllerServiceId)).toPromise()
                    .then((response:any) => {
                        return response;
                    });
            }

            /**
             * Gets the schema for the specified table.
             * @param {string} id the data source id
             * @param {string} table the table name
             * @param {string} [opt_schema] the schema name
             */
            getTableSchema (id:any, table:any, opt_schema:any) {
                var options:any = {params: {}};
                if (typeof opt_schema === 'string') {
                    options.params.schema = opt_schema;
                }

                return this.http.get(this.restUrlService.GET_DATASOURCES_URL + "/" + id + "/tables/" + table, options).toPromise()
                    .then((response:any) => {
                        return response;
                    });
            }

            /**
             * Lists the tables for the specified data source.
             * @param {string} id the data source id
             * @param {string} [opt_query] the table name query
             */
            listTables (id:any, opt_query:any) {
                var options:any = {params: {}};
                if (typeof opt_query === 'string' && opt_query.length > 0) {
                    options.params.tableName = "%" + opt_query + "%";
                }

                return this.http.get(this.restUrlService.GET_DATASOURCES_URL + "/" + id + "/tables", options).toPromise()
                    .then((response:any) => {
                        // Get the list of tables
                        let tables : any[] = [];
                        if (Array.isArray(response)) {
                            tables = response.map((table:any) => {
                                var schema = table.substr(0, table.indexOf("."));
                                var tableName = table.substr(table.indexOf(".") + 1);
                                return {schema: schema, tableName: tableName, fullName: table, fullNameLower: table.toLowerCase()};
                            });
                        }

                        // Search for tables matching the query
                        if (typeof opt_query === 'string' && opt_query.length > 0) {
                            var lowercaseQuery = opt_query.toLowerCase();
                            return tables.filter((table:any) => {
                                return table.fullNameLower.indexOf(lowercaseQuery) !== -1;
                            });
                        } else {
                            return tables;
                        }
                    }).catch((e:any) => {
                            throw e;
                       });
            }

            query (datasourceId:any, sql:any) {
                return this.http.get(this.restUrlService.GET_DATASOURCES_URL + "/" + datasourceId + "/query?query=" + sql).toPromise()
                    .then((response:any) => {
                        return response;
                    }).catch((e:any) => {
                        throw e;
                    });
            }

            preview (datasourceId:any, schema:string, table:string, limit:number) {
                return this.http.post(this.restUrlService.PREVIEW_DATASOURCE_URL(datasourceId, schema, table, limit),"").toPromise()
                    .then((response:any) => {
                        return response;
                    }).catch((e:any) => {
                        throw e;
                    });
            }

           getPreviewSql (datasourceId:any, schema:string, table:string, limit:number) {
                return this.http.get(this.restUrlService.PREVIEW_DATASOURCE_URL(datasourceId, schema, table, limit)).toPromise()
                    .then((response:any) => {
                        return response;
                    }).catch((e:any) => {
                        throw e;
                    });
            }

            getTablesAndColumns (datasourceId:any, schema:any) {
                var params = {schema: schema};
                return this.http.get(this.restUrlService.GET_DATASOURCES_URL + "/" + datasourceId + "/table-columns", {params: params});
            }

            /**
             * Creates a new JDBC data source.
             * @returns {JdbcDatasource} the JDBC data source
             */
            newJdbcDatasource () {
                let d:any = {
                    "@type": this.JDBC_TYPE,
                    name: "",
                    description: "",
                    owner: null,
                    roleMemberships: [],
                    sourceForFeeds: [],
                    type: "",
                    databaseConnectionUrl: "",
                    databaseDriverClassName: "",
                    databaseDriverLocation: "",
                    databaseUser: "",
                    password: ""
                };
                return d;
            }

            saveRoles (datasource:any) {

               return this.entityAccessControlService.saveRoleMemberships('datasource',datasource.id,datasource.roleMemberships);

            }

            /**
             * Saves the specified data source.
             * @param {JdbcDatasource} datasource the data source to be saved
             * @returns {Promise} with the updated data source
             */
            save (datasource:any) {
                return this.http.post(this.restUrlService.GET_DATASOURCES_URL, datasource).toPromise()
                    .then((response:any) => {
                        return response;
                    });
            }

           testConnection (datasource: any) {
                return this.http.post(this.restUrlService.GET_DATASOURCES_URL + "/test", datasource,{headers :  new HttpHeaders({'Content-Type':'application/json; charset=utf-8'})}).toPromise();
            }
}