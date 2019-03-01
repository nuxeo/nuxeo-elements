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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for toggling quickfilters.
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-quick-filters/index.html
   */
  class QuickFilters extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      .quick-filters {
        background-color: var(--nuxeo-pill-filter-background, #fff);
        color: var(--nuxeo-pill-text, #6d7684);
        border-radius: 3em;
        box-shadow: none;
        font-size: 1rem;
        padding: .2em .7em .3em;
        margin: .1em .1em .1em 0;
        text-transform: none;
      }

      .quick-filters[active] {
        box-shadow: none;
        background-color: var(--nuxeo-pill-filter-background-active, #00adff );
        color: var(--nuxeo-pill-text-active, #fff);
      }
    </style>

    <div id="filters">
      <dom-repeat items="[[quickFilters]]" as="filter" id="filterList">
        <template>
          <paper-button toggles="" noink="" class="quick-filters" active\$="[[filter.active]]" on-click="_selectFilter">
              [[_computeFilterLabel(filter)]]
          </paper-button>
        </template>
      </dom-repeat>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-quick-filters';
    }

    static get properties() {
      return {
        /**
         * Quick filters state.
         */
        quickFilters: {
          type: Array,
        },
      };
    }

    _selectFilter(e) {
      for (let i = 0; i < this.quickFilters.length; i++) {
        if (this.quickFilters[i].name === e.model.filter.name) {
          this.set(`quickFilters.${i}.active`, !this.quickFilters[i].active);
        }
      }
    }

    _computeFilterLabel(filter) {
      return this.i18n(`ui.label.quickFilters.${filter.name}`);
    }
  }

  customElements.define(QuickFilters.is, QuickFilters);
  Nuxeo.QuickFilters = QuickFilters;
}
