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
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { idlePeriod, microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import './nuxeo-tooltip.js';

{
  /**
   * A responsive menu that only displays elements fitting the available space. Remaining elements will be placed
   * in a dropdown menu.
   *
   * Example:
   *
   *     <nuxeo-actions-menu>
   *       <nuxeo-add-to-collection-button document="[[document]]"></nuxeo-add-to-collection-button>
   *       <nuxeo-preview-button document="[[document]]"></nuxeo-preview-button>
   *       <nuxeo-favorites-toggle-button document="[[document]]"></nuxeo-favorites-toggle-button>
   *     </nuxeo-actions-menu>
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-actions-menu/index.html
   */
  class ActionsMenu extends mixinBehaviors([IronResizableBehavior, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host, #main {
        @apply --layout-horizontal;
        @apply --layout-center;
      }

      [hidden] {
        display: none !important;
      }

      #reparent, #reparent > * {
        width: 0;
        height: 0;
        overflow: hidden;
      }

      #slot::slotted(*), /* chrome, safari */
      #main::slotted(*) { /* firefox, edge */
        @apply --nuxeo-actions-menu-main;
      }

      #dropdown::slotted(*), /* chrome, safari */
      paper-listbox::slotted(*) { /* firefox, edge */
        outline: none;
        user-select: none;
        @apply --nuxeo-actions-menu-dropdown;
      }

      paper-menu-button {
        --paper-menu-button: {
          padding: 0;
        }
      }

      paper-listbox {
        @apply --layout-vertical;
      }
    </style>
    
    <div id="main">
      <slot id="slot"></slot>
    </div>
    <div id="reparent"></div>
    <paper-menu-button id="dropdownButton" close-on-activate="" no-overlap="" horizontal-align="right">
      <paper-icon-button icon="icons:more-vert" slot="dropdown-trigger" alt="dropdown"></paper-icon-button>
      <paper-listbox slot="dropdown-content">
        <slot id="dropdown" name="dropdown"></slot>
      </paper-listbox>
    </paper-menu-button>
    <paper-tooltip for="dropdownButton">[[i18n('actionsMenu.more')]]</paper-tooltip>
`;
    }

    static get is() {
      return 'nuxeo-actions-menu';
    }

    connectedCallback() {
      super.connectedCallback();
      this._observer = new FlattenedNodesObserver(this, ({addedNodes, removedNodes}) => {
        // mark unresolved custom elements
        const unresolved = addedNodes.filter((node) => node.tagName && node.tagName.includes('-') &&
          !customElements.get(node.tagName.toLowerCase()));
        // defer rendering for non resolved elements
        unresolved.forEach((node) =>
          customElements.whenDefined(node.tagName.toLowerCase()).then(this._layout.bind(this)));
        if ((addedNodes.length > 0 && unresolved.length === 0) || removedNodes.length > 0) {
          // do instant rendering if we're removing nodes or adding at least one resolved element
          this._layout();
        }
      });
      this.addEventListener('iron-resize', this._layout);
      this.addEventListener('dom-change', this._layout);
      this.addEventListener('iron-overlay-opened', this._reparent);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._observer.disconnect();
      this.removeEventListener('iron-resize', this._layout);
      this.removeEventListener('dom-change', this._layout);
      this.removeEventListener('iron-overlay-opened', this._reparent);
    }

    ready() {
      super.ready();
    }

    get contentWidth() {
      return this._getMenuElements().reduce((sum, current) => sum + current.clientWidth, 0);
    }

    _reparent(e) {
      const src = e.composedPath()[0];
      if ((src.tagName === 'NUXEO-DIALOG' || src.tagName === 'PAPER-DIALOG') && e.target.slot === 'dropdown') {
        const parent = e.target.parentElement;
        const sibling = e.target.nextElementSibling;
        const action = e.target;
        /**
         * XXX: Instead of reparenting dialogs, this handler reparents the actions that trigger dialogs instead, to
         * prevent issues with stacking contexts. The goal is threefold:
         *  1) to prevent the backdrop from overlaping the dialog
         *  2) to prevent the dialog from disappearing when the dropdown is closed
         *  3) to preserve the dialogs inside the actions, which might need to be accessible for custom logics
         */
        idlePeriod.run(() => {
          this.$.reparent.appendChild(action);
          action._actionsMenuReparent = action._actionsMenuReparent || ((evt) => {
            let path = evt.composedPath();
            if (path[0].tagName !== 'NUXEO-DIALOG' && path[0].tagName !== 'PAPER-DIALOG') {
              // we don't want to move the action back if the event is comming from a non-dialog element
              return;
            }
            path = path.slice(0, path.findIndex((el) => el === action));
            if (path.filter((el) => el.tagName === 'NUXEO-DIALOG' || el.tagName === 'PAPER-DIALOG').length > 1) {
              // nor if it comes from an inner dialog
              return;
            }
            parent.insertBefore(action, sibling);
          });
          action.addEventListener('iron-overlay-closed', action._actionsMenuReparent);
        });
      }
    }

    _getMenuElements() {
      return this.$.slot.assignedNodes({flatten: true}).filter((node) => node.nodeType === Node.ELEMENT_NODE);
    }

    _getDropdownElements() {
      return this.$.dropdown.assignedNodes({flatten: true}).filter((node) => node.nodeType === Node.ELEMENT_NODE);
    }

    _moveToMenu(el) {
      el.slot = '';
      el.removeAttribute('show-label');
    }

    _moveToDropdown(el) {
      el.slot = 'dropdown';
      el.setAttribute('show-label', '');
    }

    _layout(e) {
      if (e && e.type && e.composedPath().find((el) => el.id === 'reparent' || el.id === 'dropdownButton')) {
        return; // skip events from within reparented actions
      }
      this.__layoutDebouncer = Debouncer.debounce(
        this.__layoutDebouncer, microTask,
        () => {
          let els = this._getDropdownElements();
          /**
           * XXX: We're using this.contentWidth instead of this.scrollWidth because it takes too much time to be
           * updated on polyfilled browsers (Firex and Edge), leading to an empty menu if there's a single element
           * that doesn't fit on the menu.
           */
          while (els.length && this.contentWidth <= this.clientWidth) {
            this._moveToMenu(els.shift());
          }
          if (!els.length) {
            this.$.dropdownButton.hidden = true;
          }
          // let's move any element in the menu to the "dropdown" slot if it doesn't fit
          els = this._getMenuElements();
          while (els.length && (this.contentWidth + this.$.dropdownButton.offsetWidth) > this.clientWidth) {
            this._moveToDropdown(els.pop());
            if (this.$.dropdownButton.hidden) {
              this.$.dropdownButton.hidden = false;
            }
          }
        },
      );
    }
  }

  customElements.define(ActionsMenu.is, ActionsMenu);
  Nuxeo.ActionsMenu = ActionsMenu;
}
