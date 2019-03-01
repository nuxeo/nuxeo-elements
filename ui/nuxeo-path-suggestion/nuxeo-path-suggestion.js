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
import '@nuxeo/nuxeo-elements/nuxeo-document.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-page-provider.js';
import '@nuxeo/paper-typeahead/paper-typeahead.js';
import '@polymer/polymer/lib/elements/dom-if.js';


{
  /**
   * An element that provides path auto completion to nuxeo folderish documents.
   *
   *     <nuxeo-path-suggestion value="/"></nuxeo-path-suggestion>
   *
   * ### Styling
   *
   * The following custom properties and mixins are available for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-path-suggestion-results` | Mixin applied to the results pane | `{}`
   * `--nuxeo-path-suggestion-result` | Mixin applied to the result items | `{}`
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-path-suggestion/index.html
   */
  class PathSuggestion extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        padding-bottom: 8px;
      }

      paper-typeahead {
        --paper-typeahead-results: {
          background-color: white;
          z-index: 100;
          @apply --nuxeo-path-suggestion-results;
        };

        --paper-typeahead-result: {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          direction: rtl;
          text-align: left;
          @apply --nuxeo-path-suggestion-result;
        };

        --paper-input-container-underline: {
          z-index: 0;
        };
      }

      paper-typeahead:focus {
        outline: none;
        @apply --nuxeo-path-suggestion-focus;
      }

      label {
        @apply --nuxeo-label;
      }
    </style>
    <nuxeo-page-provider
      id="provider"
      provider="nxql_search"
      params="[[params]]"
      page-size="20"
      current-page="{{children}}">
    </nuxeo-page-provider>
    <nuxeo-document id="parent" enrichers="[[enrichers]]"></nuxeo-document>

    <dom-if if="[[label]]">
      <template>
        <label>[[label]]</label>
      </template>
    </dom-if>

    <paper-typeahead
      id="typeahead"
      value="{{value}}"
      data="[[data]]"
      allowed-pattern="[[allowedPattern]]"
      auto-validate="[[autoValidate]]"
      on-focus="_onFocus"
      disabled\$="[[disabled]]"
      no-label-float>
    </paper-typeahead>
`;
    }

    static get is() {
      return 'nuxeo-path-suggestion';
    }

    static get properties() {
      return {
        parent: {
          type: Object,
          notify: true,
        },

        query: String,

        params: Object,

        /**
         * List of content enrichers to use.
         */
        enrichers: {
          type: String,
          value: '',
        },

        value: {
          type: String,
          observer: '_valueChanged',
          notify: true,
        },

        data: Object,

        children: {
          type: Array,
          observer: '_childrenChanged',
          notify: true,
        },

        label: String,

        autoValidate: {
          type: Boolean,
          value: true,
        },

        allowedPattern: {
          type: String,
          value: '[^()\\+*%]',
        },

        disabled: {
          type: Boolean,
          observer: '_disabledChanged',
          reflectToAttribute: true,
        },
      };
    }

    displayResults() {
      this.$.typeahead.tryDisplayResults();
    }

    hideResults() {
      this.$.typeahead.closeResults();
    }

    _onFocus() {
      this.$.typeahead.typedValue = this.value;
      this.displayResults();
    }

    _childrenChanged() {
      if (this.children) {
        if (this.children.length === 1 && this.children[0].path === this.$.typeahead.typedValue) {
          this.hideResults();
        } else {
          this.data = this.children.map((child) => `${child.path}/`);
          this.displayResults();
        }
      }
    }

    _valueChanged() {
      if (this.value && !this.disabled) {
        const idx = this.value.lastIndexOf('/');
        if (idx > -1) {
          const newParentPath = (idx === 0 ? '/' : this.value.substring(0, idx));
          this._updateParent(newParentPath).then(() => {
            this._queryChildren(this.parent, this.value.substring(idx + 1));
          }).catch((err) => {
            if (err.status === 403) {
              this.children = [];
            }
          });
        }
      }
    }

    _updateParent(newParentPath) {
      if (!this.parent || newParentPath !== this.$.parent.docPath) {
        this.$.parent.docPath = newParentPath;
        return this.$.parent.get().then((response) => {
          this.parent = response;
        }).catch((error) => {
          if (!(error.code === 'org.nuxeo.ecm.core.api.DocumentNotFoundException' &&
              error.message === newParentPath)) {
            throw error;
          }
        });
      } else {
        return new Promise(((resolve) => {
          resolve();
        }));
      }
    }

    _queryChildren(parent, term) {
      this.params = {
        queryParams: `SELECT * FROM Document WHERE ecm:parentId = '${parent.uid}' ` +
        `AND ecm:name LIKE '${term}%' AND ecm:mixinType = 'Folderish' ` +
        'AND ecm:mixinType != \'HiddenInNavigation\' AND ecm:isVersion = 0 ' +
        'AND ecm:isTrashed = 0',
      };
      return this.$.provider.fetch();
    }

    _disabledChanged() {
      if (!this.disabled) {
        this._valueChanged();
      }
    }
  }

  customElements.define(PathSuggestion.is, PathSuggestion);
  Nuxeo.PathSuggestion = PathSuggestion;
}
