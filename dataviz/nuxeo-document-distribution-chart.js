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
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';

import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { arc } from 'd3-shape';
import { select, selectAll } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { randomColor } from './randomColor.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  let vis;
  let radius;
  let _partition;
  let _arc;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  const b = {
    w: 100, h: 30, s: 3, t: 10,
  };

  const colors = {};

  /**
   * A sunburst chart presenting Nuxeo Document Distribution.
   *
   * Example:
   *
   *     <nuxeo-document-distribution-chart index="nuxeo"
   *       path="/default-domain" mode="count" max-depth="7"
   *       chart-hue="red" chart-lumonisity="light"
   *       include-version include-hidden"
   *       include-deleted only-folder">
   *     </nuxeo-document-distribution-chart>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-document-distribution-chart/index.html
   */
  class DocumentDistributionChart extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        color: var(--nuxeo-text-default, #000);
      }

      #du {
        font-size: 1rem;
        font-weight: 400;
        width: 100%;
        height: 700px;
        margin-top: 10px;
      }

      #main {
        float: left;
        width: 70%;
      }

      #sb {
        float: right;
        width: 30%;
      }

      #sequence {
        width: 100%;
        height: 70px;
      }

      #chart {
        position: relative;
      }

      #chart path {
        stroke: #fff;
      }

      #ex {
        position: absolute;
        top: 260px;
        left: 305px;
        width: 140px;
        text-align: center;
        z-index: 10;
      }

      #cl {
        font-size: 2rem;
      }

      :host([loading]) .loadable {
        opacity: 0.25;
      }

      :host([loading]) paper-spinner-lite {
        position: absolute;
        top: 45%;
        left: 50%;
        --paper-spinner-color: var(--default-primary-color);
      }

    </style>

    <nuxeo-connection id="nx" connection-id="[[connectionId]]"></nuxeo-connection>

    <div id="du">
      <div id="main" class="loadable">
        <div id="sequence"></div>
        <div id="chart">
          <div id="ex" style="visibility: hidden;">
            <span id="cl"></span><br>
            <span id="clb"></span>
          </div>
        </div>
      </div>
      <div id="sb" class="loadable">
        <paper-radio-group selected="{{mode}}" on-paper-radio-group-changed="execute">
          <paper-radio-button noink="" name="size">[[i18n('documentDistributionChart.size')]]</paper-radio-button>
          <paper-radio-button noink="" name="count">[[i18n('documentDistributionChart.count')]]</paper-radio-button>
        </paper-radio-group>
        <p>
        <paper-checkbox noink
          on-change="execute"
          checked="{{includeHidden}}">[[i18n('documentDistributionChart.includeHidden')]]</paper-checkbox>
        </p><p>
        <paper-checkbox noink
          on-change="execute"
          checked="{{includeDeleted}}">[[i18n('documentDistributionChart.includeDeleted')]]</paper-checkbox>
        </p><p>
        <paper-checkbox noink
          on-change="execute"
          checked="{{includeVersion}}">[[i18n('documentDistributionChart.includeVersions')]]</paper-checkbox>
        </p><p>
        <paper-checkbox noink
          on-change="execute"
          checked="{{onlyFolder}}"
          disabled="[[_chechFolderDisabled(mode)]]">[[i18n('documentDistributionChart.foldersOnly')]]</paper-checkbox>
        </p><p>
      </p></div>

      <paper-spinner-lite active\$="[[loading]]"></paper-spinner-lite>

    </div>
`;
    }

    static get is() {
      return 'nuxeo-document-distribution-chart';
    }

    static get properties() {
      return {
        /**
         * The id of a nuxeo-connection to use.
         */
        connectionId: {
          type: String,
          value: 'nx',
        },

        /**
         * The name of the index.
         */
        index: {
          type: String,
          value: 'nuxeo',
        },

        /**
         * Path of the document to scan. For instance '/default-domain/workspaces'.
         * Leave blank to scan the full repository.
         */
        path: {
          type: String,
          value: '',
        },

        /**
         * Possible values are 'size' for Document size or 'count' for Document count.
         */
        mode: {
          type: String,
          value: 'size',
          observer: '_observeMode',
        },

        /**
         * Maximum depth to scan in the hierarchy.
         */
        maxDepth: {
          type: Number,
          value: 10,
        },

        /**
         * Possible values are 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink' and 'monochrome'.
         */
        chartLuminosity: {
          type: String,
          value: 'light',
        },

        /**
         * Possible values are 'bright', 'light' or 'dark'.
         */
        chartHue: {
          type: String,
          value: 'blue',
        },

        /**
         * Chart width.
         */
        width: {
          type: Number,
          value: 750,
        },

        /**
         * Chart height.
         */
        height: {
          type: Number,
          value: 600,
        },

        /**
         * To take into account hidden Documents (i.e. Documents with HiddenInNavigation facet).
         */
        includeHidden: {
          type: Boolean,
          value: false,
        },

        /**
         * To take into account Versions in the size/count computation.
         *
         * LIMITATION: the size of Versions are not properly taken into account in the final result.
         */
        includeVersion: {
          type: Boolean,
          value: false,
        },

        /**
         * To take into account trashed Documents.
         */
        includeDeleted: {
          type: Boolean,
          value: true,
        },

        /**
         * To take into account folder Documents (i.e. Documents with Folderish facet).
         */
        onlyFolder: {
          type: Boolean,
          value: false,
        },

        _chartData: {
          type: Object,
        },

        loading: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
          value: false,
        },

        /**
         * Maximum number of documents returned per hierarchy level.
         */
        maxDocSize: {
          type: Number,
          value: 1000,
        },
      };
    }

    ready() {
      super.ready();
      this.execute();
    }

    _chechFolderDisabled(mode) {
      return mode === 'size';
    }

    _observeMode() {
      if (this.mode === 'size') {
        this.onlyFolder = false;
      }
    }

    _computeSizeQuery() {
      const pathDepth = this.path.replace(/\/$/, '').split('/').length;

      let subPart = {
        size: {
          sum: {
            field: 'file:content.length',
          },
        },
      };
      for (let depth = (pathDepth - 1) + this.maxDepth; depth > pathDepth; depth--) {
        subPart = {
          size: {
            sum: {
              field: 'file:content.length',
            },
          },
          subLevel: {
            terms: {
              field: `ecm:path@level${depth}`,
              size: this.maxDocSize,
            },
            aggs: subPart,
          },
        };
      }
      const query = {
        query: {
          bool: {
            must: {
              match_all: {},
            },
            must_not: this._computeMustNot(),
            filter: this._computeFilter(),
          },
        },
        size: 0,
        aggs: {
          subLevel: {
            terms: {
              field: `ecm:path@level${pathDepth}`,
              size: this.maxDocSize,
            },
            aggs: subPart,
          },
        },
      };
      return query;
    }

    _computeDocCountQuery() {
      const pathDepth = this.path.replace(/\/$/, '').split('/').length;

      let subPart = {
        subLevel: {
          terms: {
            field: `ecm:path@level${(pathDepth - 1) + this.maxDepth}`,
            size: this.maxDocSize,
            order: {
              _count: 'desc',
            },
          },
        },
      };

      for (let depth = (pathDepth - 2) + this.maxDepth; depth >= pathDepth; depth--) {
        subPart = {
          subLevel: {
            terms: {
              field: `ecm:path@level${depth}`,
              size: this.maxDocSize,
              order: {
                _count: 'desc',
              },
            },
            aggs: subPart,
          },
        };
      }
      const query = {
        query: {
          bool: {
            must: {
              match_all: {},
            },
            must_not: this._computeMustNot(),
            filter: this._computeFilter(),
          },
        },
        size: 0,
        aggs: subPart,
      };
      return query;
    }

    _computeMustNot() {
      const result = [];
      if (!this.includeHidden) {
        result.push({
          term: {
            'ecm:mixinType': 'HiddenInNavigation',
          },
        });
      }
      if (!this.includeDeleted) {
        result.push({
          term: {
            'ecm:isTrashed': true,
          },
        });
      }
      return result;
    }

    _computeFilter() {
      const result = [];
      if (this.onlyFolder && this.mode !== 'size') {
        result.push({
          term: {
            'ecm:mixinType': 'Folderish',
          },
        });
      }
      if (!this.includeVersion) {
        result.push({
          term: {
            'ecm:isVersion': false,
          },
        });
      }
      if (this.path && this.path.length > 0) {
        const split = this.path.replace(/\/$/, '').split('/');
        for (let i = 1; i < split.length; i++) {
          const toPush = {
            term: {},
          };
          toPush.term[`ecm:path@level${i}`] = split[i];
          result.push(toPush);
        }
      }
      return result;
    }

    execute() {
      this.loading = true;
      let query;
      if (this.mode === 'size') {
        query = this._computeSizeQuery();
      } else if (this.mode === 'count') {
        query = this._computeDocCountQuery();
      } else {
        alert('Mode must be either size or docCount');
        return;
      }
      let url = [this.$.nx.client._baseURL, 'site/es', this.index, 'doc', '_search'].join('/');
      url = url.replace(/(^\/+)|([^:])\/\/+/g, '$2/');

      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: query,
        url,
      };
      return this.$.nx.request().then((request) => request
        .execute(options)
        .then(this._handleResponse.bind(this))
        .catch(this._handleError.bind(this)));
    }

    _handleError(reason) {
      console.error(reason);
      this.dispatchEvent(new CustomEvent('error', {
        composed: true,
        bubbles: true,
        detail: { reason, error: reason },
      }));
      this.loading = false;
    }

    _handleResponse(response) {
      this._buildSunBurst(response.aggregations);
      this.loading = false;
    }

    _transformSubBuckets(bucket) {
      bucket.name = bucket.key;
      bucket.color = this._getColor(bucket.name, this.chartHue, this.chartLuminosity);
      let size;
      if (this.mode === 'size') {
        size = bucket.size.value;
        delete bucket.size;
      } else if (this.mode === 'count') {
        size = bucket.doc_count;
        delete bucket.doc_count;
      }
      delete bucket.key;
      bucket.size = size;
      if (bucket.subLevel) {
        bucket.children = bucket.subLevel.buckets;
        delete bucket.subLevel;
        if (bucket.children.length === 0) {
          return;
        }
        for (let j = 0; j < bucket.children.length; j++) {
          this._transformSubBuckets(bucket.children[j]);
        }
      }
    }

    _buildSunBurst(aggs) {
      const aggregations = aggs.subLevel;
      aggregations.name = 'root';
      aggregations.color = this._getColor(aggregations.name, this.chartHue, this.chartLuminosity);
      aggregations.children = aggregations.buckets;
      delete aggregations.buckets;
      delete aggregations.doc_count_error_upper_bound;
      delete aggregations.sum_other_doc_count;
      for (let i = 0; i < aggregations.children.length; i++) {
        this._transformSubBuckets(aggregations.children[i]);
      }

      this._chartData = aggregations;

      // Dimensions of sunburst.
      radius = Math.min(this.width, this.height) / 2;

      // Total size of all segments; we set this later, after loading the data.
      this.totalSize = 0;

      const svg = this.$.chart.querySelector('svg');
      if (svg) {
        svg.parentNode.removeChild(svg);
      }

      vis = select(this.$.chart).append('svg:svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .append('svg:g')
        .attr('id', 'container')
        .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

      _partition = partition()
        .size([2 * Math.PI, radius * radius]);

      _arc = arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => Math.sqrt(d.y0))
        .outerRadius((d) => Math.sqrt(d.y1));

      this._createVisualization();
    }

    _getColor(pathPart, hue, luminosity) {
      let result = colors[pathPart];
      if (result === undefined) {
        result = randomColor({
          hue,
          luminosity,
        });
        colors[pathPart] = result;
      }
      return result;
    }

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
    _getAncestors(node) {
      const path = [];
      let current = node;
      while (current.parent) {
        path.unshift(current);
        current = current.parent;
      }
      return path;
    }

    // Update the breadcrumb trail to show the current sequence and percentage.
    _updateBreadcrumbs(nodeArray, percentageString) {

      // Data join; key function combines name and depth (= position in sequence).
      const g = select(dom(this.root).querySelector('#trail'))
        .selectAll('g')
        .data(nodeArray, (d) => d.data.name + d.data.depth);

      // Add breadcrumb and label for entering nodes.
      const entering = g.enter().append('svg:g');

      entering.append('svg:polygon')
        .attr('points', this._breadcrumbPoints)
        .style('fill', (d) => d.data.color);

      entering.append('svg:text')
        .attr('x', (b.w + b.t) / 2)
        .attr('y', b.h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text((d) => {
          if (d.data.name.length > 10) {
            return `${d.data.name.substring(0, 9)}...`;
          } else {
            return d.data.name;
          }
        });

      // Set position for entering and updating nodes.
      g.attr('transform', (d, i) => `translate(${i * (b.w + b.s)}, 0)`);

      // Remove exiting nodes.
      g.exit().remove();

      // Now move and update the percentage at the end.
      select(dom(this.root).querySelector('#trail').querySelector('#endlabel'))
        .attr('x', (nodeArray.length + 0.5) * (b.w + b.s))
        .attr('y', b.h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(percentageString);

      // Make the breadcrumb trail visible, if it's hidden.
      select(dom(this.root).querySelector('#trail'))
        .style('visibility', '');

    }

    // Main function to draw and set up the visualization, once we have the data.
    _createVisualization() {

      this._initializeBreadcrumbTrail();

      // Bounding circle underneath the sunburst, to make it easier to detect
      // when the mouse leaves the parent g.
      vis.append('svg:circle')
        .attr('r', radius)
        .style('opacity', 0);

      // Turn the data into a d3 hierarchy and calculate the sums.
      const root = hierarchy(this._chartData)
        .sum((d) => d.size)
        .sort((c, d) => d.value - c.value);

      // For efficiency, filter nodes to keep only those large enough to see.
      const nodes = _partition(root).descendants().filter((d) => (d.x1 - d.x0 > 0.005)); // 0.005 radians = 0.29 degrees

      const path = vis.data([this._chartData]).selectAll('path')
        .data(nodes)
        .enter()
        .append('svg:path')
        .attr('display', (d) => (d.depth ? null : 'none'))
        .attr('d', _arc)
        .attr('fill-rule', 'evenodd')
        .style('fill', (d) => d.data.color)
        .style('opacity', 1)
        .on('mouseover', this._mouseover.bind(this));

      // Add the mouseleave handler to the bounding circle.
      select(dom(this.root).querySelector('#container')).on('mouseleave', this._mouseleave);

      // Get total size of the tree = value of root node from partition.
      this.totalSize = path.datum().value;
    }

    // Fade all but the current sequence, and show it in the breadcrumb trail.
    _mouseover(d) {

      const percentage = ((100 * d.value) / this.totalSize).toPrecision(3);
      let percentageString = `${percentage}%`;
      if (percentage < 0.1) {
        percentageString = '< 0.1%';
      }

      select(this.$.cl)
        .text(this._formatValue(d.value, true));
      select(this.$.clb)
        .text(`(${percentageString})`);

      select(this.$.ex)
        .style('visibility', '');

      const sequenceArray = this._getAncestors(d);
      this._updateBreadcrumbs(sequenceArray, percentageString);

      // Fade all the segments.
      selectAll(dom(this.root).querySelectorAll('#chart path'))
        .style('opacity', 0.3);

      // Then highlight only those that are an ancestor of the current segment.
      vis.selectAll('#chart path')
        .filter((node) => (sequenceArray.indexOf(node) >= 0))
        .style('opacity', 1);
    }

    // Restore everything to full opacity when moving off the visualization.
    _mouseleave() {
      // return;
      // Hide the breadcrumb trail
      // d3.select(Polymer.dom(this.root).querySelector('#trail'))
      //   .style('visibility', 'hidden');
      //
      // // Deactivate all segments during transition.
      // d3.selectAll(Polymer.dom(this.root).querySelectorAll('#chart path'))
      //   .on('mouseover', null);
      //
      // // Transition each segment to full opacity and then reactivate it.
      // d3.selectAll(Polymer.dom(this.root).querySelectorAll('#chart path'))
      //   .transition()
      //   .duration(1000)
      //   .style('opacity', 1)
      //   .each('end', function () {
      //     d3.select(this).on('mouseover', this._mouseover.bind(this));
      //   });
      //
      // d3.select(this.$.ex)
      //   .style('visibility', 'hidden');
    }

    _initializeBreadcrumbTrail() {
      while (this.$.sequence.firstChild) {
        this.$.sequence.removeChild(this.$.sequence.firstChild);
      }

      // Add the svg area.
      const trail = select(this.$.sequence).append('svg:svg')
        .attr('width', '100%')
        .attr('height', 50)
        .attr('id', 'trail');
      // Add the label at the end, for the percentage.
      trail.append('svg:text')
        .attr('id', 'endlabel')
        .style('fill', '#000');

      select(this.$.cl)
        .text('');
      select(this.$.clb)
        .text('');
    }

    // Generate a string that describes the points of a breadcrumb polygon.
    _breadcrumbPoints(d, i) {
      const points = [];
      points.push('0,0');
      points.push(`${b.w},0`);
      points.push(`${b.w + b.t},${b.h / 2}`);
      points.push(`${b.w},${b.h}`);
      points.push(`0,${b.h}`);
      if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(`${b.t},${b.h / 2}`);
      }
      return points.join(' ');
    }

    _formatValue(value, si) {
      if (this.mode === 'size') {
        const thresh = si ? 1000 : 1024;
        if (Math.abs(value) < thresh) {
          return `${value} B`;
        }
        const units = si
          ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
          : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        do {
          value /= thresh;
          ++u;
        } while (Math.abs(value) >= thresh && u < units.length - 1);
        return `${value.toFixed(1)} ${units[u]}`;
      } else if (this.mode === 'count') {
        let result = value + (value === this.maxDocSize ? '+ ' : ' ');
        if (value > 1) {
          result += this.i18n('documentDistributionChart.documents');
        } else {
          result += this.i18n('documentDistributionChart.document');
        }
        return result;
      } else {
        return value;
      }
    }
  }

  customElements.define(DocumentDistributionChart.is, DocumentDistributionChart);
  Nuxeo.DocumentDistributionChart = DocumentDistributionChart;
}
