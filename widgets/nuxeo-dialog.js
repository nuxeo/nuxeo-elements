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
import { NeonAnimationRunnerBehavior } from '@polymer/neon-animation/neon-animation-runner-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { PaperDialogBehavior } from '@polymer/paper-dialog-behavior/paper-dialog-behavior.js';
import '@polymer/paper-dialog-behavior/paper-dialog-shared-styles.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';

{
  /**
   * A dialog element.
   *
   * If a `<template>` is passed as the dialog's content, that `<template>` will be stamped when dialog is opened.
   *
   * @appliesMixin Polymer.NeonAnimationRunnerBehavior
   * @appliesMixin Polymer.Templatizer
   * @memberof Nuxeo
   * @demo demo/nuxeo-dialog/index.html
   */
  class Dialog
    extends mixinBehaviors([
      PaperDialogBehavior, NeonAnimationRunnerBehavior, Templatizer], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="paper-dialog-shared-styles">
      :host {
        @apply --nuxeo-dialog;
      }

      :host > ::slotted(h2),
      :host > ::slotted(*) {
        margin-top: 16px;
      }

      :host > ::slotted(.buttons) {
        @apply --layout-horizontal;
        @apply --layout-justified;
        margin-top: 16px;
        background-color: var(--nuxeo-dialog-buttons-bar, white);
      }
    </style>

    <slot></slot>
`;
    }

    static get is() {
      return 'nuxeo-dialog';
    }

    static get properties() {
      return {
        /**
         * Make sure dialog is positioned after the backdrop element.
         * Should only be used when the dialog appears behind the backdrop because of stacking context issues.
         */
        reparent: {
          type: Boolean,
          value: false,
        },
      };
    }

    ready() {
      super.ready();
      this.addEventListener('iron-overlay-opened', this._opened);
    }

    disconnectedCallback() {
      // workaround to prevent IronOverlayBehavior.detached() from being called when unattached
      if (this._observer) {
        this.detached();
      }
      this._instance = null;
    }

    _opened(e) {
      const isIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
      if ((this.reparent && e.target.withBackdrop) || isIOS) {
        e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
      }

      if (!this._instance) {
        const template = dom(this).querySelector('nuxeo-dialog > template');
        if (template) {
          // prevent "A <template> can only be templatized once" error
          if (!this._templatizerTemplate) {
            this.templatize(template);
          }
          this._instance = this.stamp();
          this.appendChild(this._instance.root);
        }
      }
    }

    _forwardHostPropV2(prop, value) {
      if (this._instance) {
        this._instance.forwardHostProp(prop, value);
      }
    }
  }

  customElements.define(Dialog.is, Dialog);
  Nuxeo.Dialog = Dialog;
}
