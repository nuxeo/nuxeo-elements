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
import '@polymer/polymer/polymer-legacy.js';
import './nuxeo-es-search.js';

window.Nuxeo = window.Nuxeo || {};
/**
 * `Nuxeo.AggregateDataBehavior` provides the shared aggregate data behavior.
 *
 * @polymerBehavior Nuxeo.AggregateDataBehavior
 */
Nuxeo.AggregateDataBehavior = {
  properties: {
    /**
     * The id of a nuxeo-connection to use.
     */
    connectionId: {
      type: String,
      value: 'nx',
    },

    /**
     * The index to query.
     */
    index: {
      type: String,
      value: 'nuxeo',
    },

    /**
     * Filter terms
     */
    where: {
      type: Object,
      value: () => {
        return {};
      },
    },


    /**
     * Top level term aggregation(s).
     * Comma-separated values..
     */
    groupedBy: {
      type: String,
      value: '',
    },

    /**
     * Limit number of buckets for the top level term aggregation.
     */
    groupLimit: {
      type: Number,
      value: -1,
    },

    /**
     * An object with the field as key and an array of ranges to use in the nested range aggregation as value.
     */
    withRanges: {
      type: Object,
      value: () => {
        return {};
      },
    },

    /**
     * Filter by start date.
     */
    startDate: {
      type: String,
      value: '',
    },

    /**
     * Filter by end date.
     */
    endDate: {
      type: String,
      value: '',
    },

    /**
     * Date field to use
     */
    dateField: {
      type: String,
      value: 'dc:created',
    },

    /**
     * Interval to use for the nested date histogram aggregation
     */
    withDateIntervals: {
      type: String,
      value: '',
    },

    /**
     * Date format to use as key in the date intervals aggregates
     */
    dateFormat: {
      type: String,
      value: 'yyyy-MM-dd',
    },

    /**
     * Skip building buckets for the whole date interval on the histogram aggregation
     */
    withoutExtendedBounds: {
      type: Boolean,
      value: false,
    },

    /**
     * The field to use in the single-value metrics aggregation.
     * This can be just the field name or include the `metrics-op` to use as well, ex: `avg(field)`
     */
    metrics: {
      type: String,
      value: '',
    },

    /**
     * The single-value metrics aggregation to use.
     * Can be one of: `avg`, `min`, `max.
     * It not set default is `count` which returns the `doc_count`
     */
    metricsOperator: {
      type: String,
      value: 'count',
    },

    query: Object,

    aggregates: Object,

    data: {
      type: Array,
      value: () => [],
      notify: true,
    },

  },

  observers: [
    // update the aggregates
    '_aggregates(groupedBy, groupLimit, withRanges, withDateIntervals, metrics, metricsOperator, startDate, endDate)',
    // trigger the request
    '_doFetch(index, query, aggregates)',
  ],

  ready() {
    // build our search request
    this._query();
    this._aggregates();
  },

  get _metricsAggregation() {
    const parts = this.metrics.match(/[^()]+/g);

    if (!parts) return;

    let metricsOn;
    let metricsOp;
    if (parts.length === 1) {
      [metricsOn] = parts;
      metricsOp = this.metricsOperator;
    } else if (parts.length === 2) {
      [metricsOp, metricsOn] = parts;
    } else {
      throw new Error('Invalid metrics');
    }

    const field = this._fieldFor(metricsOn) || this._fieldFor(this.aggregatedOn);

    if (metricsOp === 'count') {
      metricsOp = 'terms';
    }

    const agg = {};
    let metrics;

    // make the count/terms work as a regular aggregation
    if (metricsOp === 'terms') {
      metrics = agg.by = {};
    } else {
      metrics = agg.metrics = {};
    }

    metrics[metricsOp] = {
      field,
    };
    return agg;
  },

  _getNestedAggregation() {
    if (this.withDateIntervals) {
      const histogram = {
        field: this.dateField,
        interval: this.withDateIntervals,
        format: this.dateFormat,
        min_doc_count: 0,
      };

      if (!this.withoutExtendedBounds) {
        if (this.startDate && this.endDate) {
          histogram.extended_bounds = {
            min: this.startDate,
            max: this.endDate,
          };
        } else {
          console.warn('Both start and end date should be set when using date aggregation with extended bounds');
        }
      }

      return {
        by: {
          date_histogram: histogram,
        },
      };
    }

    const key = Object.keys(this.withRanges)[0];
    if (key) {
      return {
        by: {
          range: {
            field: this._fieldFor(key),
            ranges: this.withRanges[key],
          },
        },
      };
    }

  },

  // return ordered list of top level term aggregations
  get _topLevelAggregations() {
    const aggs = this.groupedBy.split(',').map((term) => {
      return {
        by: {
          terms: {
            field: this._fieldFor(term.trim()),
          },
        },
      };
    });

    // set max number of buckets to return
    if (this.groupLimit !== -1 && aggs.length) {
      aggs[0].by.terms.size = this.groupLimit;
    }

    return aggs;
  },

  _aggregates() {

    const levels = [];

    if (this.groupedBy) {
      Array.prototype.push.apply(levels, this._topLevelAggregations);
    }
    if (this.withDateIntervals || this.withRanges) {
      levels.push(this._getNestedAggregation());
    }
    if (this.metrics) {
      levels.push(this._metricsAggregation);
    }

    const result = {};
    let current = result;
    levels.forEach((level) => {
      if (level) {
        const key = Object.keys(level)[0];
        current.aggs = level;
        current = level[key];
      }
    });

    this.aggregates = result.aggs;
  },

  /**
   * Fetch aggregation.
   */
  fetch() {
    // template is not stamped & data system not initialized until the element has been connected :(
    if (!this._search) {
      this._search = document.createElement('nuxeo-es-search');
      this._attachDom(this._search);
    }
    this._search.connectionId = this.connectionId;
    this._search.index = this.index;
    this._search.query = this.query;
    this._search.aggregates = this.aggregates;

    return this._search.execute().then(this._onResults.bind(this));
  },

  _doFetch() {
    if (this.index && this.query && this.aggregates) {
      this.debounce('do-fetch', this.fetch.bind(this));
    }
  },

  _onResults(result) {
    if (result && result.aggregations) {
      this.data = this._unwrapAggregation(result.aggregations);
    }
  },

  _unwrapAggregation(bucket) {
    const key = bucket.key_as_string || bucket.key;
    let value;
    if (bucket.by) {
      value = bucket.by.buckets.map(this._unwrapAggregation.bind(this));
    } else {
      value = this._getMetricsValue(bucket);
    }
    return key !== undefined ? { key, value } : value;
  },

  // unwrap out metrics value
  _getMetricsValue(bucket) {
    return bucket.metrics ? bucket.metrics.value : bucket.doc_count;
  },

  // Helper functions

  get _dateRange() {
    if (!this.startDate && !this.endDate) {
      return;
    }
    const term = {range: {}};
    const range = term.range[this.dateField] = {};
    if (this.startDate) {
      range.gte = this.startDate;
    }
    if (this.endDate) {
      range.lte = this.endDate;
    }
    return term;
  },

  _fieldFor(column) {
    return column;
  },

  _buildTerms(terms) {
    if (Array.isArray(this.where)) {
      this.where.forEach((term) => {
        terms.push(term);
      });
    } else {
      Object.keys(this.where).forEach((key) => {
        const term = {};
        term[key] = this.where[key];
        terms.push({ term });
      }, this);
    }
    return {bool: {must: terms}};
  },
};
