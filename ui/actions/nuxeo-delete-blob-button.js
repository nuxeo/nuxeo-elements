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
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';
import '../nuxeo-button-styles.js';

{
  /**
   * A button element for deleting a file blob from a document.
   *
   * Example:
   *
   *     <nuxeo-delete-blob-button document="[[document]]"></nuxeo-delete-blob-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-delete-blob-button/index.html
   */
  class DeleteBlobButton extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles nuxeo-button-styles"></style>

        <nuxeo-operation
          id="operation"
          op="Blob.RemoveFromDocument"
          input="[[document.uid]]"
          params="[[_params(xpath)]]"
        >
        </nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('deleteBlobButton.dialog.heading')]]</h2>
          <div>[[i18n('deleteBlobButton.dialog.message')]]</div>
          <div class="buttons">
            <paper-button dialog-dismiss class="secondary">[[i18n('deleteBlobButton.dialog.no')]]</paper-button>
            <paper-button dialog-confirm on-click="_remove" class="primary"
              >[[i18n('deleteBlobButton.dialog.yes')]]</paper-button
            >
          </div>
        </nuxeo-dialog>
        <nuxeo-connection id="nx" connection-id="[[connectionId]]"></nuxeo-connection>
        <nuxeo-resource id="blobRequest"></nuxeo-resource>
      `;
    }

    static get is() {
      return 'nuxeo-delete-blob-button';
    }

    static get properties() {
      return {
        connectionId: {
          type: String,
          value: 'nx',
        },
        /**
         * Input document.
         */
        document: Object,

        /**
         * Path of the file object to delete.
         * For example `xpath="files:files/0/file"`.
         */
        xpath: {
          type: String,
          value: 'file:content',
        },

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:remove',
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
      return (
        doc &&
        this.hasPermission(doc, 'WriteProperties') &&
        !this.isImmutable(doc) &&
        !this.hasType(doc, 'Root') &&
        !this.isTrashed(doc) &&
        !this._isPropUnderRetention(doc)
      );
    }

    _isPropUnderRetention(doc) {
      if (doc && doc.isUnderRetentionOrLegalHold && doc.retainedProperties && doc.retainedProperties.length > 0) {
        const { retainedProperties } = doc;
        /* if retained property is multivalued attachment, and all files are to be retained, denoted by '*',
          then return true.
          if retained property is multivalued attachment, but only a single file is to be retained,
          then return true only for that file */
        return retainedProperties.find(
          (prop) =>
            this._transformXpathRegex(prop, this.xpath) || // xpath = docname:files/*/file
            prop.startsWith(this.xpath) || // xpath = docname:files/1/file
            (prop.includes(this.xpath.split('/')[0]) && !prop.includes('/')), // xpath = docname:files
        );
      }
      return false;
    }

    _transformXpathRegex(prop, xpath) {
      const transformedArray = [];
      const splitter = '/';
      const star = '*';
      if (prop.includes(star)) {
        let xpathArray = xpath.split(splitter);

        for (let i = 0; i < xpathArray.length; i++) {
          if (!Number.isNaN(parseInt(xpathArray[i], 10))) {
            xpathArray[i] = star;
          }
          transformedArray.push(xpathArray[i]);
        }
        xpathArray = transformedArray;
        xpath = xpathArray.join(splitter);
      }
      return prop === xpath;
    }

    _computeLabel() {
      return this.i18n('deleteBlobButton.tooltip');
    }

    _toggleDialog() {
      this.$.dialog.toggle();
    }

    _params(xpath) {
      return {
        xpath: xpath.startsWith('files:') ? xpath.split('/file')[0] : xpath,
      };
    }

    _remove() {
      const [xpath, rowNo] = this.xpath.split('/');
      if (
        rowNo &&
        xpath &&
        this.document.properties[xpath] &&
        this.document.properties[xpath][rowNo] &&
        this.document.properties[xpath][rowNo].fichier
      ) {
        const { 'upload-batch': uploadBatch, 'upload-fileId': uploadFileId } = this.document.properties[xpath][
          rowNo
        ].fichier;
        if (uploadBatch && uploadFileId) {
          this.$.blobRequest.data = {};
          this.$.blobRequest.path = `upload/${uploadBatch}/${uploadFileId}`;
          this.$.blobRequest
            .remove()
            .then((response) => {
              this._dispatchEvent('file-deleted', response);
            })
            .catch((error) => {
              this._dispatchEvent('error', error);
            });
        } else {
          this._removeBlob();
        }
      } else {
        this._removeBlob();
      }
    }

    _removeBlob() {
      this.$.operation.execute().then((response) => {
        this._dispatchEvent('file-deleted', response);
      });
    }

    _dispatchEvent(eventName, response) {
      this.dispatchEvent(
        new CustomEvent(eventName, {
          composed: true,
          bubbles: true,
          detail: {
            response,
          },
        }),
      );
    }
  }

  customElements.define(DeleteBlobButton.is, DeleteBlobButton);
  Nuxeo.DeleteBlobButton = DeleteBlobButton;
}
