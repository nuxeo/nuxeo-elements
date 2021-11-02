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
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { pathFromUrl } from '@polymer/polymer/lib/utils/resolve-url.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '../nuxeo-layout.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * `nuxeo-search-results-layout`
   * @group Nuxeo UI
   * @appliesMixin Nuxeo.I18nBehavior
   * @element nuxeo-search-results-layout
   */
  class SearchResultsLayout extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <nuxeo-layout
          id="results"
          href="[[_resultsHref(searchName, hrefBase)]]"
          model="[[_resultsModel(searchName,nxProvider)]]"
          error="[[i18n('searchResults.layoutNotFound', searchName)]]"
          on-element-changed="_formChanged"
        ></nuxeo-layout>
      `;
    }

    static get is() {
      return 'nuxeo-search-results-layout';
    }

    static get importMeta() {
      return import.meta;
    }

    static get properties() {
      return {
        /**
         * The name of the search layout.
         */
        searchName: String,
        /**
         * The `nuxeo-page-provider` instance used to perform the search.
         */
        nxProvider: HTMLElement,
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
         * The `nuxeo-results` element bound to this element.
         */
        results: {
          type: Object,
          notify: true,
        },
        /**
         * The base url for the layout href.
         */
        hrefBase: String,
      };
    }

    get element() {
      return this.$.results && this.$.results.element;
    }

    fetch() {
      if (this.results) {
        this.results.fetch();
      } else {
        return Promise.resolve();
      }
    }

    reset() {
      if (this.results) {
        this.results.reset();
      }
    }

    _resultsHref(searchName, hrefBase) {
      if (!searchName) {
        return '';
      }
      const name = searchName.toLowerCase();
      const base = hrefBase || pathFromUrl(this.__dataHost.importPath || this.importPath);
      return `${base}${name}/${['nuxeo', name, 'search-results'].join('-')}.html`;
    }

    _resultsModel() {
      return { nxProvider: this.nxProvider, name: this.searchName };
    }

    _formChanged(e) {
      afterNextRender(this, () => {
        this.results = e.detail.value && this._grabResults([e.detail.value]);
      });
    }

    _grabResults(els) {
      if (!Array.isArray(els) || els.length === 0) {
        return;
      }
      // let's find the results element on the local and light dom of the current elements
      let i;
      let el;
      for (i = 0; i < els.length; i++) {
        el = els[i];
        let results = dom(el).querySelector('nuxeo-results');
        if (!results && el.root) {
          results = dom(el.root).querySelector('nuxeo-results');
        }
        if (results) {
          return results;
        }
      }
      // none found; let's do the same for the children of the current elements
      let children = [];
      for (i = 0; i < els.length; i++) {
        el = els[i];
        if (el.root) {
          children = [].concat.apply(children, children.concat(dom(el.root).querySelectorAll('*')));
        }
      }
      return this._grabResults(children);
    }
  }
  customElements.define(SearchResultsLayout.is, SearchResultsLayout);
}
