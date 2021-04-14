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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { pathFromUrl } from '@polymer/polymer/lib/utils/resolve-url.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '../nuxeo-layout.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';

{
  /**
   * `nuxeo-search-form-layout`
   * @group Nuxeo UI
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.RoutingBehavior
   * @element nuxeo-search-form-layout
   */
  class SearchFormLayout extends mixinBehaviors([I18nBehavior, RoutingBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <nuxeo-layout
          id="layout"
          href="[[_formHref(provider, searchName, hrefBase)]]"
          model="[[_formModel(provider, aggregations, params)]]"
          error="[[i18n('documentSearchForm.layoutNotFound', searchName)]]"
          on-element-changed="_formChanged"
        ></nuxeo-layout>
      `;
    }

    static get is() {
      return 'nuxeo-search-form-layout';
    }

    static get importMeta() {
      return import.meta;
    }

    static get properties() {
      return {
        /**
         * The `nuxeo-page-provider` instance used to perform the search.
         */
        provider: String,
        /**
         * The name of the search layout.
         */
        searchName: String,
        /**
         * The parameters passed on to `provider`.
         */
        params: {
          type: Object,
          notify: true,
        },
        /**
         * If `true`, aggregates from page provider definition will not be computed.
         */
        skipAggregates: {
          type: Boolean,
          notify: true,
        },
        /**
         * The aggregations returned by `provider`.
         */
        aggregations: {
          type: Object,
          observer: '_aggregationsChanged',
        },
        /**
         * An object propagating key/values served by enclosing slot contents.
         */
        model: {
          type: Object,
          value() {
            return {};
          },
        },
        /**
         * The base url for the layout href.
         */
        hrefBase: String,
      };
    }

    static get observers() {
      return ['_paramsChanged(params.*)'];
    }

    get element() {
      return this.$.layout.element;
    }

    _paramsChanged() {
      if (this.element) {
        this.element.params = this.params;
      }
    }

    _aggregationsChanged() {
      if (this.element) {
        this.element.aggregations = this.aggregations;
      }
    }

    _formHref(provider, searchName, hrefBase) {
      const name = (searchName || provider).toLowerCase();
      const base = hrefBase || pathFromUrl(this.__dataHost.importPath || this.importPath);
      return `${base}${name}/${['nuxeo', name, 'search-form'].join('-')}.html`;
    }

    _formModel() {
      return {
        provider: this.provider,
        params: this.params,
        aggregations: this.aggregations,
      };
    }

    _formChanged(e) {
      this.dispatchEvent(
        new CustomEvent('search-form-layout-changed', {
          composed: true,
          bubbles: true,
          detail: e.detail,
        }),
      );
      // forward params change events
      this.element.addEventListener('params-changed', (evt) => {
        this.notifyPath(evt.detail.path || 'params', evt.detail.value);
      });
      this.skipAggregates = this.element.skipAggregates;
      this.element.addEventListener('skip-aggregates-changed', (evt) => {
        this.notifyPath(evt.detail.path || 'skipAggregates', evt.detail.value);
      });
    }
  }
  customElements.define(SearchFormLayout.is, SearchFormLayout);
}
