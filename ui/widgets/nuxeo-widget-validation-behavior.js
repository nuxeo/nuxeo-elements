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
import '@polymer/polymer/polymer-legacy.js';

let uniqueId = 0;

/**
 * `Nuxeo.WidgetValidationBehavior` conveys a widget's validation failure as text and as state
 * assistive technologies can discover.
 *
 * Widgets signal a failure with colour, a thicker underline and an error label placed next to the
 * control, which on its own conveys nothing programmatically and, when no message was configured,
 * nothing at all (WCAG 2.1 SC 1.4.1 Use of Color, SC 3.3.3 Error Suggestion). This behavior gives an
 * empty required field a default message and mirrors `invalid`, `required` and `errorMessage` onto
 * the focusable control as `aria-invalid`, `aria-required` and `aria-describedby`.
 *
 * A host opts in to the aria state by returning its focusable control from `_ariaValidationControl`.
 * Hosts whose control is re-rendered outside Polymer's control - selectivity rebuilds its input on
 * every selection change, and `nuxeo-file` stamps its button in a `dom-if` - pass the container to
 * `_observeAriaValidationControl` so the state is re-applied to the replacement.
 *
 * @polymerBehavior Nuxeo.WidgetValidationBehavior
 */
export const WidgetValidationBehavior = {
  observers: ['_ariaValidationStateChanged(invalid, required, errorMessage)'],

  detached() {
    this._disconnectAriaValidationObserver();
  },

  /**
   * Gives an empty required field a message naming the reason for the failure, so the error is not
   * conveyed by colour alone. Only defaults when the host supplied none, so a message configured by
   * a layout - and a pattern or range error the host reported itself - is never clobbered.
   *
   * A host calls this once its own validation has failed, and `_clearDefaultRequiredError` once it
   * passes.
   */
  _applyDefaultRequiredError() {
    if (this._isWidgetRequired() && this._isEmptyWidgetValue()) {
      if (!this.errorMessage || this._defaultRequiredError) {
        this.errorMessage = this.i18n('widget.required');
        this._defaultRequiredError = true;
      }
    } else {
      this._clearDefaultRequiredError();
    }
  },

  /**
   * Clears only the message this behavior defaulted, so a host or layout supplied one is kept.
   */
  _clearDefaultRequiredError() {
    if (this._defaultRequiredError) {
      this.errorMessage = '';
      this._defaultRequiredError = false;
    }
  },

  /**
   * Whether the host must hold a value. Hosts that carry the flag somewhere other than their own
   * `required` property override this - a layout generated for a multivalued property flags the
   * entry widget of the row form, not the table holding the entries.
   *
   * @return {boolean} True when a value is mandatory.
   */
  _isWidgetRequired() {
    return !!this.required;
  },

  /**
   * Whether the host holds no value. Hosts with a value that is not `this.value` override this.
   *
   * @return {boolean} True when the value is empty.
   */
  _isEmptyWidgetValue() {
    const { value } = this;
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  },

  /**
   * The focusable control that carries the state. Hosts override this; returning nothing opts out,
   * which is what a host that delegates to an inner widget wants.
   *
   * @return {?Element} The control, or null.
   */
  _ariaValidationControl() {
    return null;
  },

  /**
   * The element rendering `errorMessage`, referenced by `aria-describedby`. It has to live in the
   * same shadow root as the control for the reference to resolve.
   *
   * @return {?Element} The message element, or null.
   */
  _ariaValidationMessageElement() {
    return this.shadowRoot ? this.shadowRoot.querySelector('.error') : null;
  },

  _ariaValidationStateChanged() {
    this._syncAriaValidationState();
  },

  /**
   * Re-applies the state once the current render settles, so a control that Polymer or selectivity
   * has not stamped yet is still picked up.
   */
  _syncAriaValidationState() {
    if (this._ariaValidationSyncPending) {
      return;
    }
    this._ariaValidationSyncPending = true;
    setTimeout(() => {
      this._ariaValidationSyncPending = false;
      this._applyAriaValidationState();
    }, 0);
  },

  _applyAriaValidationState() {
    const control = this._ariaValidationControl();
    if (!control) {
      return;
    }
    control.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');
    if (this._isWidgetRequired()) {
      control.setAttribute('aria-required', 'true');
    } else {
      control.removeAttribute('aria-required');
    }
    const message = this._ariaValidationMessageElement();
    if (!message) {
      return;
    }
    if (!message.id) {
      uniqueId += 1;
      message.id = `nuxeo-widget-error-${uniqueId}`;
    }
    if (this.invalid && this.errorMessage) {
      control.setAttribute('aria-describedby', message.id);
    } else {
      control.removeAttribute('aria-describedby');
    }
  },

  /**
   * Watches `container` for a re-render of the control, so the state survives it. Attribute changes
   * are not observed, which keeps the state we apply from triggering another run.
   *
   * @param {Element} container The element whose subtree holds the control.
   */
  _observeAriaValidationControl(container) {
    if (!container || this._ariaValidationObserver) {
      return;
    }
    this._ariaValidationObserver = new MutationObserver(() => this._syncAriaValidationState());
    this._ariaValidationObserver.observe(container, { childList: true, subtree: true });
  },

  _disconnectAriaValidationObserver() {
    if (this._ariaValidationObserver) {
      this._ariaValidationObserver.disconnect();
      this._ariaValidationObserver = null;
    }
  },
};
