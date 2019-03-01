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
   * An element providing metrics data on workflows.
   *
   * A query is a configurable nested aggregation with 3 aggregation levels:
   *
   * - `grouped-by`: top level term aggregations (comma-separated values)
   * - `with-*`: nested multi-bucket aggregation (with-ranges | with-date-intervals)
   * - `metrics`: leaf single-value metrics aggregation (max, min, avg, sum)
   *
   * Example:
   *
   *     <nuxeo-workflow-data workflow="worflowModelName"
   *                             task="taskName"
   *                             grouped-by="action"
   *                             with-ranges='{
   *                               "duration":[
   *                                 {"key":"quick", "to":"1500"},
   *                                 {"key":"slow", "from":"1500"}
   *                               ]}'
   *                             metrics="sum(amount)"
   *                             start-date="[[startDate]]"
   *                             end-date="[[endDate]]"
   *                             data="{{data}}">
   *     </nuxeo-workflow-data>
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
   * @demo demo/workflow.html
   */
  class WorkflowData extends Nuxeo.AggregateDataElement {

    static get is() {
      return 'nuxeo-workflow-data';
    }

    static get properties() {
      return {
        index: {
          type: String,
          value: 'audit_wf',
        },

        /**
         * the name of the event to filter by
         */
        event: {
          type: String,
          value: '',
        },

        /**
         * the workflow model name
         */
        workflow: String,

        /**
         * the name of the task to filter by
         */
        task: {
          type: String,
          value: '',
        },

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
      return [
        '_query(workflow, startDate, endDate)',
        '_aggregates(groupedBy, withRanges, withDateIntervals, metrics, metricsOperator, startDate, endDate)',
      ];
    }

    _query() {
      const event = this.event || (this.task ? 'afterWorkflowTaskEnded' : 'afterWorkflowFinish');

      const terms = [
        {term: {eventId: event}},
        {term: {'extended.modelName': this.workflow}},
      ];

      if (this.task) {
        terms.push({term: {'extended.taskName': this.task}});
      }
      if (this._dateRange) {
        terms.push(this._dateRange);
      }

      this.query = this._buildTerms(terms);
    }

    // @override
    _fieldFor(column) {
      // TODO: limit 'exposed' fields to system field (ex: 'user', 'taskName', 'action', etc) and 'workflowVariables.*'
      return `extended.${column}`;
    }

  }

  customElements.define(WorkflowData.is, WorkflowData);
  Nuxeo.WorkflowData = WorkflowData;
}
