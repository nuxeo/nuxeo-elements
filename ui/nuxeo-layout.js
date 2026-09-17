/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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
import { I18nBehavior } from './nuxeo-i18n-behavior.js';
import './nuxeo-error.js';

{
  // Fallback validation messages injected by `_reportValidation`, so a message configured by
  // the layout is never overwritten and a fallback that no longer applies gets recomputed.
  const fallbackErrorMessages = new WeakMap();

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
  class Layout extends mixinBehaviors([IronResizableBehavior, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <nuxeo-error id="error" code="404" url="[[href]]" message="[[error]]" hidden></nuxeo-error>
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
      return ['_update(model.*)'];
    }

    _getBoundElements(property) {
      const model = {};
      for (let i = 0; i < this.element.__templateInfo.nodeInfoList.length; i++) {
        const nodeInfo = this.element.__templateInfo.nodeInfoList[i];
        const node = this.element.__templateInfo.nodeList[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
          const field = node.hasAttribute('field') && node.getAttribute('field');
          if (field && field.startsWith(property)) {
            model[field] = node;
          }
          if (nodeInfo.bindings) {
            nodeInfo.bindings.forEach((binding) => {
              if (binding.kind === 'property') {
                binding.parts.forEach((part) => {
                  if (part.mode === '{' && !part.signature && part.source.startsWith(property)) {
                    model[part.source] = model[part.source] || [];
                    model[part.source] = node;
                  }
                });
              }
            });
          }
        }
      }
      return model;
    }

    /**
     * Fired once every `validate` run has settled, carrying the errors that made it fail.
     *
     * @event layout-validation-errors
     * @param {Array<object>} errors One `{ element, label, message }` entry per invalid widget, or a
     * single form level entry when the layout's own `validate` rejected the form. Empty when valid.
     */

    // Trigger the layout validation if it exists.
    validate() {
      // workaround for https://github.com/PolymerElements/iron-form/issues/218, adapted from iron-form.html
      let valid = true;
      const invalidElements = [];
      if (this.element) {
        const elements = this._getValidatableElements(this.element.root);
        for (let el, i = 0; i < elements.length; i++) {
          el = elements[i];
          const elementValid = this._validateElement(el);
          if (!elementValid) {
            invalidElements.push(el);
          }
          valid = elementValid && valid;
        }
      }
      if (!valid) {
        this._reportValidation(false, invalidElements);
        return false;
      }
      if (this.element && typeof this.element.validate === 'function') {
        // The layout runs its own, possibly asynchronous, validation. Report only once it settles,
        // so the errors we publish always match the validity we return.
        const validated = this.element.validate();
        if (validated && typeof validated.then === 'function') {
          return validated.then((customValid) => {
            this._reportValidation(customValid, invalidElements);
            return customValid;
          });
        }
        this._reportValidation(validated, invalidElements);
        return validated;
      }
      this._reportValidation(true, invalidElements);
      return true;
    }

    _validateElement(element) {
      return element.validate ? element.validate() : element.checkValidity();
    }

    /**
     * Widgets flag validation failures with colour and a thicker underline only, which is not
     * enough on its own (WCAG 2.1 SC 1.4.1 Use of Color, SC 3.3.3 Error Suggestion). Give every
     * invalid widget a visible message naming the field when its layout did not provide one, and
     * publish the list so hosts can also render a form level error summary.
     */
    _reportValidation(valid, elements) {
      const errors = elements.map((element) => {
        const label = this._fieldLabel(element);
        let message = element.errorMessage;
        // A widget that validates itself may already have defaulted to the generic `widget.required`
        // text and flagged it via `_defaultRequiredError`. That default only exists for widgets used
        // outside a layout, so treat it as replaceable here and name the field instead. A message the
        // author set on the widget carries no such flag and is still preserved.
        if (!message || message === fallbackErrorMessages.get(element) || element._defaultRequiredError) {
          message = this._defaultErrorMessage(element, label);
          fallbackErrorMessages.set(element, message);
          if ('errorMessage' in element) {
            element.errorMessage = message;
          }
        }
        return { element, label, message };
      });
      if (!valid && errors.length === 0) {
        // The layout's own validation rejected the form without pointing at a widget. Report a form
        // level message anyway, so a host never clears its summary while the form is still invalid.
        errors.push({ element: this.element, label: '', message: this.i18n('layout.validation.invalidForm') });
      }
      this.dispatchEvent(
        new CustomEvent('layout-validation-errors', { bubbles: true, composed: true, detail: { errors } }),
      );
    }

    _defaultErrorMessage(element, label) {
      const key = this._isEmptyValue(element) ? 'layout.validation.requiredField' : 'layout.validation.invalidField';
      return label ? this.i18n(`${key}.named`, label) : this.i18n(key);
    }

    _fieldLabel(element) {
      // A widget whose label does not live on the element itself - a data table carries the property
      // label on its column - names itself through `_validationLabel`.
      const own = typeof element._validationLabel === 'function' ? element._validationLabel() : '';
      const label = own || element.label || element.getAttribute('aria-label') || element.getAttribute('label') || '';
      return label.trim();
    }

    _isEmptyValue(element) {
      const value = 'value' in element ? element.value : element.selected;
      return value == null || value === '' || (Array.isArray(value) && value.length === 0);
    }

    _getValidatableElements(parent) {
      const nodes = dom(parent).querySelectorAll('*');
      const submittable = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node.disabled && this._isVisible(node)) {
          if (node.validate || node.checkValidity) {
            submittable.push(node);
          } else if (node.root) {
            Array.prototype.push.apply(submittable, this._getValidatableElements(node.root));
          }
        }
      }
      return submittable;
    }

    _isVisible(node) {
      // HACK - exclude fallback content from slots when not visible - see ELEMENTS-1393 for more details
      const styles = window.getComputedStyle(node);
      return (
        node &&
        node.offsetParent &&
        (node.offsetHeight > 0 || node.offsetWidth > 0 || (styles.opacity > 0 && styles.visibility !== 'hidden'))
      );
    }

    _stamp(href) {
      if (!href) {
        this.hidden = true;
        this._setElement(null);
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
