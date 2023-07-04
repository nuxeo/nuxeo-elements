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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';

{
  /**
  `nuxeo-video-conversions`
  @group Nuxeo UI
  @element nuxeo-video-conversions
  */
  class VideoConversions extends mixinBehaviors([I18nBehavior, FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          a,
          a:active,
          a:visited,
          a:focus {
            @apply --nuxeo-link;
          }
          a:hover {
            @apply --nuxeo-link-hover;
          }
          .properties label {
            @apply --nuxeo-label;
            min-width: 10rem;
            margin-inline-end: 12px;
          }
          .properties .item {
            @apply --layout-horizontal;
            @apply --layout-flex;
            @apply --layout-justified;
            line-height: 2.2rem;
          }
        </style>
        <dom-if if="[[label]]">
          <template>
            <h3>[[label]]</h3>
          </template>
        </dom-if>
        <div class="properties">
          <dom-repeat items="[[document.properties.vid:transcodedVideos]]" as="conversion">
            <dom-if if="[[conversion.content]]">
              <template>
                <div class="item">
                  <label>[[conversion.name]]</label>
                  <span>[[conversion.info.width]] x [[conversion.info.height]]</span>
                  <span>[[formatSize(conversion.content.length)]]</span>
                  <a href="[[_getDownloadUrl(conversion)]]">
                    <iron-icon icon="nuxeo:download"></iron-icon>
                    <nuxeo-tooltip>[[i18n('videoViewLayout.download.tooltip')]]</nuxeo-tooltip>
                  </a>
                </div>
              </template>
            </dom-if>
          </dom-repeat>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-video-conversions';
    }

    static get properties() {
      return {
        /**
         * A video document. Should have vid:transcodedVideos properties
         */
        document: Object,
        /**
         * An optional label
         */
        label: String,
      };
    }

    _getDownloadUrl(conversion) {
      return conversion.content.downloadUrl ? conversion.content.downloadUrl : conversion.content.data;
    }
  }
  customElements.define(VideoConversions.is, VideoConversions);
}
