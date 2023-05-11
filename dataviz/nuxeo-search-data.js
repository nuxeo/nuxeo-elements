/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import './nuxeo-aggregate-data-element.js';

{
  /**
   * An element providing metrics data on searches.
   *
   * A query is a configurable nested aggregation with 3 aggregation levels:
   *
   * - `grouped-by`: top level term aggregations (comma-separated values)
   * - `with-*`: nested multi-bucket aggregation (with-ranges | with-date-intervals)
   * - `metrics`: leaf single-value metrics aggregation (max, min, avg, sum)
   *
   * Example:
   *
   *     <nuxeo-search-data grouped-by="pageProviderName"
   *                        with-ranges='{
   *                          "resultsCount":[
   *                            {"key":"no result", "to":"0"},
   *                            {"key":"less than 50", "from" : 1, "to": 50}
   *                            {"key":"more than 50", "from" : 51}
   *                        ]}'
   *                        metrics="avg(executionTimeMs)"
   *                        start-date="[[startDate]]"
   *                        end-date="[[endDate]]"
   *                        data="{{data}}">
   *     </nuxeo-search-data>
   *
   * If all the aggregation levels are configured it will produce a query like:
   *
   *     {
   *       query: { bool: { must: [...] },
   *       aggs: {
   *         by: { // grouped-by
   *           terms: {
   *             field: "extended.resultsCount"
   *           },
   *           aggs: {
   *             by: {  // with-ranges | with-date-intervals
   *               range : {
   *                 field : "extended.resultsCount",
   *                 ranges: [...]
   *               },
   *               aggs: {
   *                 metric: { // metric
   *                   avg: {
   *                     field : "extended.executionTimeMs"
   *                   }
   *                 }
   *               }
   *             }
   *           }
   *         }
   *       }
   *     }
   *
   * @memberof Nuxeo
   * @demo demo/search.html
   */
  class SearchData extends Nuxeo.AggregateDataElement {
    static get is() {
      return 'nuxeo-search-data';
    }

    static get properties() {
      return {
        index: {
          type: String,
          value: 'audit',
        },

        /**
         * the page provider name
         */
        pageProvider: String,

        /**
         * Date field to use
         */
        dateField: {
          type: String,
          value: 'eventDate',
        },
      };
    }

    static get observers() {
      return ['_query(startDate, endDate, pageProvider)'];
    }

    _query() {
      const terms = [{ term: { eventId: 'search' } }];

      if (this.pageProvider) {
        terms.push({ term: { 'extended.pageProviderName': this.pageProvider } });
      }

      if (this._dateRange) {
        terms.push(this._dateRange);
      }

      this.query = this._buildTerms(terms);
    }

    // @override
    _fieldFor(column) {
      return `extended.${column}`;
    }
  }

  customElements.define(SearchData.is, SearchData);
  Nuxeo.SearchData = SearchData;
}
