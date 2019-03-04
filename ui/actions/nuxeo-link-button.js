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
import '@polymer/paper-icon-button/paper-icon-button.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for displaying a link with an icon button.
   *
   * Example:
   *
   *     <nnuxeo-link-button href="http://www.nuxeo.org" icon=""></nuxeo-link-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class LinkButton extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      .action {
        text-decoration: none;
        color: var(--nuxeo-text-default);
      }
    </style>

    <template is="dom-if" if="[[_isAvailable(href, icon, iconSrc)]]">
      <a class="action" href="[[href]]" tabindex="-1" target="[[target]]">
        <paper-icon-button src="[[iconSrc]]" icon="[[icon]]" noink=""></paper-icon-button>
        <span class="label" hidden\$="[[!showLabel]]">[[i18n(label)]]</span>
      </a>
      <nuxeo-tooltip>[[i18n(label)]]</nuxeo-tooltip>
    </template>
`;
    }

    static get is() {
      return 'nuxeo-link-button';
    }

    static get properties() {
      return {
        /**
         * Link.
         */
        href: String,

        /**
         * Target.
         */
        target: String,

        /**
         *  The URL of an image for the icon. If the iconSrc property is specified,
         * the icon property should not be.
         */
        iconSrc: String,

        /**
         * Icon to use (iconset_name:icon_name).
         * If the icon property is specified the iconSrc property should not be.
         */
        icon: String,

        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        /**
         * Label (i18n key) to use as tooltip and label when `showLabel`is true.
         */
        label: String,
      };
    }

    _isAvailable() {
      return this.href && (this.icon || this.iconSrc);
    }
  }

  customElements.define(LinkButton.is, LinkButton);
  Nuxeo.LinkButton = LinkButton;
}
