/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
   * An element providing data from the audit index.
   *
   * The possible values for `event-id` are available as contributions to the `event` extension point of the
   * `org.nuxeo.ecm.platform.audit.service.NXAuditEventsService` service.
   *
   * A query supports additional terms:
   *
   * - `where`: array of additional terms for the `must` clause
   *
   * A query is a configurable nested aggregation with 2 aggregation levels:
   *
   * - `grouped-by`: top level term aggregations (comma-separated values)
   * - `metrics`: leaf single-value metrics aggregation (max, min, avg, sum)
   *
   * Example:
   *
   *     <nuxeo-audit-data event-id="eventId"
   *                       where='[{"term": {"downloadReason": "download"}},{"term": {"blobXPath": "blobholder:0"}}]'
   *                       grouped-by="field"
   *                       group-limit=[[groupLimit]]
   *                       metrics="sum(amount)"
   *                       start-date="[[startDate]]"
   *                       end-date="[[endDate]]"
   *                       data="{{data}}">
   *     </nuxeo-audit-data>
   *
   * If all the aggregation levels are configured it will produce a query like:
   *
   *     {
   *       query: { bool: { must: [...] },
   *       aggs: {
   *         by: { // aggregated-on
   *           terms: {
   *             field: "extended.action"
   *           },
   *           aggs: {
   *             by: {  // with-ranges | with-date-intervals
   *               range : {
   *                 field : "extended.duration",
   *                 ranges: [...]
   *               },
   *               aggs: {
   *                 metric: { // metric
   *                   sum: {
   *                     field : "extended.workflowVariables.amount"
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
   * @demo demo/audit.html
   */
  class AuditData extends Nuxeo.AggregateDataElement {

    static get is() {
      return 'nuxeo-audit-data';
    }

    static get properties() {
      return {
        /**
         * the name of the index
         */
        index: {
          type: String,
          value: 'audit',
        },

        /**
         * the name of the event to filter by
         */
        eventId: {
          type: String,
          value: '',
        },

        /**
         * Date field to use
         */
        // @override
        dateField: {
          type: String,
          value: 'eventDate',
        },
      };
    }

    static get observers() {
      return [
        '_query(eventId, where, startDate, endDate)',
        '_aggregates(groupedBy, withRanges, withDateIntervals, metrics, metricsOperator, startDate, endDate)',
      ];
    }

    _query() {
      const terms = [
        {term: {eventId: this.eventId}},
      ];

      if (this._dateRange) {
        terms.push(this._dateRange);
      }

      this.query = this._buildTerms(terms);
    }
  }

  customElements.define(AuditData.is, AuditData);
  Nuxeo.AuditData = AuditData;
}
