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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import './nuxeo-layout.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

/**
 * An element to import and stamp a document layouts.
 *
 * Example:
 *
 *     <nuxeo-document-layout document='{...}' layout="edit"></nuxeo-document-layout>
 *
 * Layouts are stamped by convetion. The href is built based on the document's type (`document.type`)
 * and the layout's name (`layout`). The layout's href is resolved in relation to this elements `importPath`
 * and it follows the following pattern:
 *
 * `${doctype}/nuxeo-${doctype)-${layout}-layout.html`
 *
 * @element nuxeo-document-layout
 * @memberof Nuxeo
 * @demo https://nuxeo.github.io/nuxeo-elements/?path=/story/ui-nuxeo-document-layout--default
 */
{
  class DocumentLayout extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          #error {
            margin-bottom: 8px;
          }

          .error {
            border-left: 4px solid var(--paper-input-container-invalid-color, red);
            color: var(--paper-input-container-invalid-color, red);
            padding-left: 8px;
          }
        </style>
        <div id="error">
          <dom-repeat items="[[_errorMessages]]">
            <template>
              <span class="error">[[item]]</span>
            </template>
          </dom-repeat>
        </div>
        <nuxeo-layout
          id="layout"
          href="[[_href]]"
          model="[[_model]]"
          error="[[i18n('documentView.layoutNotFound', document.type)]]"
          on-element-changed="_elementChanged"
        >
        </nuxeo-layout>
      `;
    }

    static get is() {
      return 'nuxeo-document-layout';
    }

    static get importMeta() {
      return import.meta;
    }

    static get properties() {
      return {
        /**
         * The document for which the layout will be stamped.
         */
        document: {
          type: Object,
          notify: true,
        },
        /**
         * An id denoting the name of the layout to be stamped.
         */
        layout: {
          type: String,
          value: 'view',
          reflectToAttribute: true,
        },
        _model: {
          type: Object,
          value: {},
          readOnly: true,
        },
        _href: {
          type: String,
          readOnly: true,
        },
        _errorMessages: {
          type: Array,
          readOnly: true,
          value: [],
        },
      };
    }

    static get observers() {
      return ['_loadLayout(document, layout)'];
    }

    /**
     * Fired on the next render after the document layout changes.
     *
     * @event document-layout-changed
     * @param {string} layout The document layout.
     * @param {object} element The document layout element.
     */

    /**
     * Returns the layout element.
     */
    get element() {
      return this.$.layout.element;
    }

    /**
     * Runs form validation on the document layout.
     */
    validate() {
      return this.$.layout.validate();
    }

    /**
     * Applies focus on the first layout child with the `autofocus` attribute.
     *
     * Note: This method won't do anything if there's already a child element focused.
     */
    applyAutoFocus() {
      const focusableElement = this._getFocusableElement(this.element);
      if (focusableElement) {
        focusableElement.focus();
      }
    }

    /**
     * Displays any errors present in a validation report, and invalidates layout widgets bound to document
     * fields whose constraints were violated.
     * @param {object} validationReport The validation report to be displayed.
     */
    reportValidation(validationReport) {
      this._resetValidationErrors();
      validationReport.violations.reverse().forEach((violation) => {
        this.invalid = true;
        if (violation.path) {
          violation.path.forEach((p) => {
            const widgets = this._getBoundElements(`document.properties.${p.field_name}`);
            if (widgets) {
              const msg = this.i18n(violation.messageKey, violation.invalid_value, p.field_name);
              if (msg === violation.messageKey && violation.constraint && violation.constraint.name) {
                this._addValidationError(
                  this.i18n(
                    `label.schema.constraint.violation.${violation.constraint.name}`,
                    violation.invalid_value,
                    p.field_name,
                    ...Object.values(violation.constraint.parameters),
                  ),
                );
              } else {
                this._addValidationError(msg);
              }
              Object.values(widgets).forEach((widget) => {
                // we can at least flag the widget `invalid`
                widget.invalid = true;
              });
            } else {
              this._addValidationError(this.i18n(violation.messageKey, violation.invalid_value, p.field_name));
            }
          });
        } else {
          this._addValidationError(this.i18n(violation.messageKey));
        }
      });
    }

    _loadLayout(document, layout) {
      this._resetValidationErrors();
      if (document) {
        if (!this.previousDocument || document.uid !== this.previousDocument.uid) {
          this._set_href(null); // force layout restamp
        }
        if (!this.previousDocument || document.type === this.previousDocument.type) {
          this._set_model({ document });
        }
        const doctype = document.type.toLowerCase();
        const name = ['nuxeo', doctype, layout, 'layout'].join('-');
        this._set_href(this.resolveUrl(`${doctype}/${name}.html`));
      } else if (document === undefined) {
        // XXX undefined is used to notify a cancel to inner elements
        this._set_model({ document });
      }
      this.previousDocument = document;
    }

    _elementChanged() {
      this._set_model({ document: this.document });
      // forward document path change events
      if (this.element) {
        this.element.addEventListener('document-changed', (e) => {
          this.notifyPath(e.detail.path, e.detail.value);
        });
      }
      afterNextRender(this, () => {
        // fire the `document-layout-changed` event only after flush
        this.dispatchEvent(
          new CustomEvent('document-layout-changed', {
            bubbles: true,
            composed: true,
            detail: {
              element: this.element,
              layout: this.layout,
            },
          }),
        );
        this.applyAutoFocus();
      });
    }

    _getBoundElements(property) {
      return this.$.layout._getBoundElements(property);
    }

    _getFocusableElement(parent) {
      if (parent && parent.shadowRoot && !parent.shadowRoot.activeElement) {
        const nodes = Array.from(parent.shadowRoot.querySelectorAll('*')).filter((node) => {
          const style = window.getComputedStyle(node);
          return !node.disabled && style.display !== 'none' && style.visibility !== 'hidden';
        });
        let focusableElement = nodes.find((node) => node.autofocus);
        if (focusableElement) {
          return focusableElement;
        }

        nodes
          .filter((node) => node.shadowRoot)
          .forEach((node) => {
            focusableElement = this._getFocusableElement(node);
            if (focusableElement) {
              return focusableElement;
            }
          });
      }
    }

    _addValidationError(message) {
      this._errorMessages.push(message);
      this.$.error.scrollIntoView();
      this.$.error.focus();
    }

    _resetValidationErrors() {
      this._set_errorMessages([]);
    }
  }

  customElements.define(DocumentLayout.is, DocumentLayout);
}
