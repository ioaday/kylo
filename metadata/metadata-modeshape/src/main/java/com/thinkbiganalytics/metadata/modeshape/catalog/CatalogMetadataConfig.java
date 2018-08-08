/**
 * 
 */
package com.thinkbiganalytics.metadata.modeshape.catalog;

/*-
 * #%L
 * kylo-metadata-modeshape
 * %%
 * Copyright (C) 2017 - 2018 ThinkBig Analytics, a Teradata Company
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import com.thinkbiganalytics.metadata.api.catalog.ConnectorProvider;
import com.thinkbiganalytics.metadata.api.catalog.DataSetProvider;
import com.thinkbiganalytics.metadata.api.catalog.DataSourceProvider;
import com.thinkbiganalytics.metadata.modeshape.catalog.connector.JcrConnectorProvider;
import com.thinkbiganalytics.metadata.modeshape.catalog.dataset.JcrDataSetProvider;
import com.thinkbiganalytics.metadata.modeshape.catalog.datasource.JcrDataSourceProvider;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 *
 */
@Configuration
public class CatalogMetadataConfig {

    @Bean
    public ConnectorProvider connectorProvider() {
        return new JcrConnectorProvider();
    }
    
    @Bean
    public DataSourceProvider dataSourceProvider() {
        return new JcrDataSourceProvider();
    }
    
    @Bean
    public DataSetProvider dataSetProvider() {
        return new JcrDataSetProvider();
    }
}