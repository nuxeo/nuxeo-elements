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
import { I18nBehavior } from '../nuxeo-i18n-behavior';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

{
  /**
  `nuxeo-video-info`
  @group Nuxeo UI
  @element nuxeo-video-info
  */

  class VideoInfo extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          .properties label {
            @apply --nuxeo-label;
            min-width: 10rem;
            margin-inline-end: 12px;
          }

          .properties .item {
            @apply --layout-horizontal;
            @apply --layout-flex;
            line-height: 2.2rem;
          }
        </style>
        <div class="properties">
          <div class="item">
            <label>[[i18n('videoViewLayout.format')]]</label>
            <div>[[document.properties.vid:info.format]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.duration')]]</label>
            <div>[[document.properties.vid:info.duration]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.width')]]</label>
            <div>[[document.properties.vid:info.width]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.height')]]</label>
            <div>[[document.properties.vid:info.height]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.frameRate')]]</label>
            <div>[[document.properties.vid:info.frameRate]]</div>
          </div>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-video-info';
    }

    static get properties() {
      return {
        /**
         * A video document. Should have vid:info properties
         */
        document: Object,
      };
    }
  }
  customElements.define(VideoInfo.is, VideoInfo);
}
