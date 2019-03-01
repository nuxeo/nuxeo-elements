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
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { importHref } from './import-href.js';
import './nuxeo-error.js';

{
  /**
   * An element to import and stamp layout elements.
   *
   * Example:
   *
   *     <nuxeo-layout href="nuxeo-note-view-layout.html" model='{"document": {...}}'></nuxeo-layout>
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @memberof Nuxeo
   */
  class Layout extends mixinBehaviors([IronResizableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <nuxeo-error id="error" code="404" url="[[href]]" message="[[error]]" hidden=""></nuxeo-error>
    <div id="container"></div>
`;
    }

    static get is() {
      return 'nuxeo-layout';
    }

    static get properties() {
      return {
        /**
         * The href of the element to import.
         * The name of the element is inferred from the filename.
         * */
        href: {
          type: String,
          observer: '_stamp',
        },

        /**
         * Model object with properties to set on the instantiated element.
         * */
        model: {
          type: Object,
          value: {},
        },

        /**
         * Error message to display if layout is not found.
         * */
        error: {
          type: String,
          value: 'Failed to find layout',
        },

        /**
         * The stamped element.
         * */
        element: {
          type: Object,
          readOnly: true,
          notify: true,
        },
      };
    }

    static get observers() {
      return [
        '_update(model.*)',
      ];
    }

    // Trigger the layout validation if it exists.
    validate() {
      if (this.element && (typeof this.element.validate === 'function')) {
        return this.element.validate();
      } else {
        // workaroud for https://github.com/PolymerElements/iron-form/issues/218, adapted from iron-form.html
        let valid = true;
        if (this.element) {
          const elements = this._getValidatableElements(this.element.root);
          for (let el, i = 0; el = elements[i], i < elements.length; i++) {
            valid = (el.validate ? el.validate() : el.checkValidity()) && valid;
          }
        }
        return valid;
      }
    }

    _getValidatableElements(parent) {
      const nodes = dom(parent).querySelectorAll('*');
      const submittable = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node.disabled) {
          if (node.validate || node.checkValidity) {
            submittable.push(node);
          } else if (node.root) {
            Array.prototype.push.apply(submittable, this._getValidatableElements(node.root));
          }
        }
      }
      return submittable;
    }

    _stamp(href) {
      if (!href) {
        this.hidden = true;
        return;
      }

      this.$.error.hidden = true;
      this.hidden = this.$.container.hidden = false;

      const file = href.split('/').pop();
      const name = file.split('.')[0];
      importHref(
        href,
        () => {
          const element = document.createElement(name);

          if (this.$.container.hasChildNodes()) {
            this.$.container.replaceChild(element, this.$.container.firstChild);
          } else {
            this.$.container.appendChild(element);
          }

          this._setElement(element);
          this._update();
          this.notifyResize();
          flush();
        },
        // error handling
        () => {
          this._setElement(undefined);
          this.$.error.hidden = false;
          this.$.container.hidden = true;
          this.notifyResize();
        },
      );
    }

    // setup data binding
    _update() {
      // Object.assign(element, model);
      if (this.element && this.model) {
        Object.keys(this.model).forEach((prop) => {
          this.element[prop] = this.model[prop];
        });
      }
    }
  }

  customElements.define(Layout.is, Layout);
  Nuxeo.Layout = Layout;
}
