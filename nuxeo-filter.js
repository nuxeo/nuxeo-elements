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

import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { enqueueDebouncer } from '@polymer/polymer/lib/utils/flush.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { FiltersBehavior } from './nuxeo-filters-behavior.js';
/* eslint-disable no-new-func,no-restricted-syntax,guard-for-in */

{
  /**
   * Stamps the template if and only if all of its conditions are met.
   *
   * Evaluation context includes `document` and `user` which need to be set if used.
   *
   * Example:
   *
   *     <nuxeo-filter document="[[document]]" type="Picture"
   *                   user="[[user]]" group="Administrator">
   *       <template>
   *         ...
   *       </template>
   *     </nuxeo-filter>
   *
   * @appliesMixin Polymer.Templatizer
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-filter/index.html
   */
  class Filter extends mixinBehaviors([Templatizer, FiltersBehavior], Nuxeo.Element) {

    static get is() {
      return 'nuxeo-filter';
    }

    static get properties() {
      return {
        /**
         * The context document
         */
        document: {
          type: Object,
          value: {},
        },

        /**
         * The context user
         */
        user: {
          type: Object,
          value: {},
        },

        /**
         * Document has one of these types
         */
        type: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document'], // the context made available to the filter function
            fn: 'hasType', // the filter function name
            multiple: true, // flag to indicate if the property takes csv values
          },
        },

        /**
         * Document has one of these facets
         */
        facet: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document'],
            fn: 'hasFacet',
            multiple: true,
          },
        },

        /**
         * Document state
         */
        state: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document'],
            fn: 'hasState',
            multiple: true,
          },
        },

        /**
         * Document path starts with
         */
        path: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document'],
            fn: 'pathStartsWith',
          },
        },

        /**
         * User has one of these permissions in the document
         */
        permission: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document'],
            fn: 'hasPermission',
            multiple: true,
          },
        },

        /**
         * Javascript expression to evaluate
         */
        expression: {
          type: String,
          value: '',
          _filter: {
            ctx: ['document', 'user'],
            fn: '_evaluate',
          },
        },

        /**
         * User is member of one of these groups
         */
        group: {
          type: String,
          value: '',
          _filter: {
            ctx: ['user'],
            fn: 'isMember',
            multiple: true,
          },
        },
      };
    }

    static get observers() {
      return [
        '_update(document, user, facet, type, state, path, permission, expression, group)',
      ];
    }

    _evaluate(document, user, expression) {
      try {
        const fn = new Function(['document', 'user'], `return ${expression};`);
        return fn.apply(this, [document, user]);
      } catch (err) {
        return false;
      }
    }

    // Evaluate the filter
    check() {
      for (const k in this.constructor.properties) {
        const v = this[k];
        const filter = this.constructor.properties[k]._filter;
        if (v && filter) {
          const args = filter.ctx.map((arg) => this[arg]);
          // if filter supports multiple values apply the function to each one
          const values = filter.multiple ? v.trim().split(/\s*,\s*/) : [v];
          const fn = this[filter.fn];

          // pass if any check returns true, basically Array.some()
          let pass = false;
          for (let i = 0; i < values.length; i++) {
            if ((pass = fn.apply(this, args.concat(values[i])))) {
              break;
            }
          }

          // if any of the filters fail the check fails
          if (!pass) {
            return false;
          }
        }
      }
      return true;
    }

    _update() {
      this.__renderDebouncer = Debouncer.debounce(this.__renderDebouncer, microTask, () => {
        if (this.check()) {
          this._render();
        } else {
          this._clear();
        }
      });
      // enqueuing is needed for testing, as it allows content to be stamped on flush
      enqueueDebouncer(this.__renderDebouncer);
    }

    _render() {
      if (this._instance) {
        return;
      }
      const parentNode = dom(this).parentNode;
      if (parentNode) {
        const template = dom(this).querySelector('template');
        const parent = dom(parentNode);
        if (template) {
          delete template.__templatizeOwner;
          this.templatize(template);
          this._instance = this.stamp();
          for (const prop in this.constructor.properties) {
            this._instance._setPendingProperty(prop, this[prop]);
          }
          // Ensure element specific properties are forwarded
          if (this.__dataHost && this.__dataHost.__data) {
            for (const [key, value] of Object.entries(this.__dataHost.__data)) {
              this._instance._setPendingProperty(key, value);
            }
          }
          this._instance._flushProperties();
          const root = this._instance.root;
          parent.insertBefore(root, this);
        }
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this._update();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._clear();
    }

    _clear() {
      if (this._instance) {
        const c$ = this._instance.children;
        if (c$ && c$.length) {
          // use first child parent, for case when dom-if may have been detached
          const parent = dom(dom(c$[0]).parentNode);
          for (let i = 0, n; (i < c$.length) && (n = c$[i]); i++) {
            parent.removeChild(n);
          }
        }
        this._instance = null;
      }
    }

    _forwardHostPropV2(prop, value) {
      if (this._instance) {
        this._instance.forwardHostProp(prop, value);
      }
    }

  }

  customElements.define(Filter.is, Filter);
  Nuxeo.Filter = Filter;
}
