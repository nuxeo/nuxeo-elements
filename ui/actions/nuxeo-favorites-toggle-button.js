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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';
import '../nuxeo-button-styles.js';

{
  /**
   * A toggle button element for adding/removing a document from the favorites.
   *
   * Example:
   *
   *     <nuxeo-favorites-toggle-button document="[[document]]"></nuxeo-favorites-toggle-button>
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-action-color-activated` | Color of the icon when activated | #00aded
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-favorites-toggle-button/index.html
   */
  class FavoritesToggleButton extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          :host([favorite]) paper-icon-button {
            color: var(--icon-toggle-pressed-color, var(--nuxeo-action-color-activated));
          }
        </style>

        <nuxeo-operation id="opAdd" op="Document.AddToFavorites" input="[[document.uid]]"></nuxeo-operation>
        <nuxeo-operation id="opRemove" op="Document.RemoveFromFavorites" input="[[document.uid]]"></nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" tabindex="0">
              <paper-icon-button
                icon="[[icon]]"
                noink
                aria-label$="[[_computeHoverLabel(favorite, document, i18n)]]"
              ></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `;
    }

    static get is() {
      return 'nuxeo-favorites-toggle-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: {
          type: Object,
          observer: '_documentChanged',
        },

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:favorites',
        },

        favorite: {
          type: Boolean,
          readOnly: true,
          notify: true,
          reflectToAttribute: true,
        },

        /**
         * `true` if the action should display the label, `false` otherwise.
         * @private
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        _label: {
          type: String,
          computed: '_computeLabel(favorite, i18n)',
        },
      };
    }

    ready() {
      super.ready();
      this.removeFromFavoritesHandler = (e) => {
        if (this.document && e.detail.docUid && e.detail.docUid === this.document.uid) {
          this._setFavorite(false);
        }
      };
      window.addEventListener('removed-from-favorites', this.removeFromFavoritesHandler);
      this.addEventListener('click', this._toggle);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener('removed-from-favorites', this.removeFromFavoritesHandler);
      this.removeFromFavoritesHandler = null;
    }

    _isAvailable(doc) {
      return this.isCollectionMember(doc);
    }

    /**
     * Fired when a document is added to favorites.
     * @event added-to-favorites
     */
    /**
     * Fired when a document is removed from favorites.
     * @event removed-from-favorites
     */
    _toggle() {
      if (!this.favorite) {
        const addToFavorite = window.confirm("Do you want to add it to favorites?");
        if (addToFavorite) {
          this.$.opAdd.execute().then(() => {
            this.dispatchEvent(
              new CustomEvent('added-to-favorites', {
                composed: true,
                bubbles: true,
                detail: { doc: this.document },
              }),
            );
            this._setFavorite(true);
          });
        }
      } else {
        const removeFromFavorite = window.confirm("Do you want to remove it from favorites?");
        if (removeFromFavorite) {
          this.$.opRemove.execute().then(() => {
            this.dispatchEvent(
              new CustomEvent('removed-from-favorites', {
                composed: true,
                bubbles: true,
                detail: { doc: this.document },
              }),
            );
            this._setFavorite(false);
          });
        }
      }
    }

    _computeLabel(favorite) {
      return this.i18n && this.i18n(`favoritesToggleButton.tooltip.${favorite ? 'remove' : 'add'}`);
    }

    _computeHoverLabel(favorite, doc) {
      return `${doc && doc.title}${this._computeLabel(favorite)}`;
    }

    _documentChanged() {
      this._setFavorite(this.isFavorite(this.document));
    }
  }

  customElements.define(FavoritesToggleButton.is, FavoritesToggleButton);
  Nuxeo.FavoritesToggleButton = FavoritesToggleButton;
}
