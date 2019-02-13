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
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for downloading the main file from a document.
   *
   * Example:
   *
   *     <nuxeo-download-button document="[[document]]"></nuxeo-download-button>
   *
   * @appliesMixin Nuxeo.FormatBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-download-button/index.html
   */
  class DownloadButton extends mixinBehaviors([FormatBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles"></style>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_download">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-download-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: Object,

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:download',
        },

        /**
         *
         * Path of the file object to download.
         * For example `xpath="files:files/0/file"`.
         */
        xpath: {
          type: String,
          value: 'file:content',
        },

        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        _label: {
          type: String,
          computed: '_computeLabel(i18n)',
        },
      };
    }

    _isAvailable(doc) {
      return this.hasContent(doc, this.formatPropertyXpath(this.xpath));
    }

    _computeLabel() {
      return this.i18n('downloadButton.tooltip');
    }

    _download() {
      const blob = this.document && this._deepFind(this.document.properties, this.xpath);
      if (blob) {
        location.href = blob.data;
      }
    }

    _deepFind(obj, props) {
      for (let i = 0, path = props.split('/'), len = path.length; i < len; i++) {
        if (!obj || obj === []) {
          break;
        }
        obj = obj[path[i]];
      }
      return obj;
    }
  }

  customElements.define(DownloadButton.is, DownloadButton);
  Nuxeo.DownloadButton = DownloadButton;
}
