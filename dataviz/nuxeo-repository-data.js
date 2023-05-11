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
   * An element providing metrics on repository data.
   *
   * A `metrics` query is a configurable nested aggregation with 3 aggregation levels:
   *
   * - `grouped-by`: top level term aggregations (comma-separated values)
   * - `with-*`: nested multi-bucket aggregation (with-ranges | with-date-intervals)
   * - `metrics`: leaf single-value metrics aggregation (count, max, min, avg, sum)
   *
   * Filtering of the data is possible by using the document property helper attributes: `ecm-primary-type`,
   * `ecm-lifecycle-state` or `ecm-mixin-type`
   *
   * It is also possible to use a `where` attribute which takes a list of clauses to include in query.
   *
   * Example:
   *
   *     <nuxeo-repository-data ecm-primary-type="Note"
   *                            where='[{"range": {"dc:created": {"gte": startDate, "lte": endDate}}}]'
   *                            grouped-by="dc:creator"
   *                            data="{{data}}">
   *     </nuxeo-repository-data>
   *
   * The previous example would produce a query like:
   *
   *     {
   *       query: {
   *         bool: {
   *           must:[
   *             {term: {"ecm:primaryType": "File"}}, // ecm-primary-type
   *             {"range": {"dc:created": {"gte": start, "lte": end}}} // where
   *           ]
   *         }
   *       }
   *       aggs: {
   *         by: { // grouped-by
   *           terms: {
   *             field: "dc:creator"
   *           }
   *         }
   *       }
   *     }
   *
   * @memberof Nuxeo
   * @demo demo/repository.html
   */
  class RepositoryData extends Nuxeo.AggregateDataElement {
    static get is() {
      return 'nuxeo-repository-data';
    }

    static get properties() {
      return {
        index: {
          type: String,
          value: 'nuxeo',
        },

        /**
         * Date field to use
         */
        dateField: {
          type: String,
          value: 'dc:created',
        },

        // Document property filter terms helpers
        /**
         * Filter by ecm:primaryType`
         */
        ecmPrimaryType: {
          type: String,
          value: '',
        },

        /**
         * Filter by ecm:lifecycleState`
         */
        ecmLifecycleState: {
          type: String,
          value: '',
        },

        /**
         * Filter by ecm:mixinType`
         */
        ecmMixinType: {
          type: String,
          value: '',
        },
      };
    }

    static get observers() {
      return [
        '_query(ecmPrimaryType, ecmLifecycleState, ecmMixinType, where, startDate, endDate)',
        '_aggregates(groupedBy, groupLimit, withRanges, withDateIntervals, metrics, metricsOperator, startDate, endDate)', // eslint-disable-line max-len
      ];
    }

    _query() {
      // TODO: clone our query to allow setting it explicitly as well
      const terms = [];

      // push document properties terms
      if (this.ecmPrimaryType) {
        terms.push({ terms: { 'ecm:primaryType': this._splitTerms(this.ecmPrimaryType) } });
      }
      if (this.ecmLifecycleState) {
        terms.push({ terms: { 'ecm:currentLifeCycleState': this._splitTerms(this.ecmLifecycleState) } });
      }
      if (this.ecmMixinType) {
        terms.push({ terms: { 'ecm:mixinType': this._splitTerms(this.ecmMixinType) } });
      }

      // filter by date (dc:created by default)
      if (this._dateRange) {
        terms.push(this._dateRange);
      }

      this.query = this._buildTerms(terms);
    }

    _splitTerms(terms) {
      if (terms) {
        return terms.split(',').map((t) => t.trim());
      }
    }
  }

  customElements.define(RepositoryData.is, RepositoryData);
  Nuxeo.RepositoryData = RepositoryData;
}
