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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';

{
  /**
   * An element for viewing videos.
   *
   * Example:
   *
   *     <nuxeo-video-viewer sources="[[sources]]" controls preload="auto"></nuxeo-video-viewer>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-video-viewer/index.html
   */
  class VideoViewer extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      #container {
        display: block;
        width: 100%;
        height: 100%;
        @apply --layout-vertical;
      }

      #video {
        background: var(--primary-background-color);
        max-height: 100%;
        width: 100%;
        outline: none;
        @apply --layout-flex;
      }

      #video.hasStoryboard {
        max-height: calc(100% - 85px);
      }

      #storyboard {
        background: var(--primary-background-color);
      }

      #thumbnails {
        overflow-x: auto;
        @apply --layout-horizontal;
      }

      .thumbnail {
        cursor: pointer;
        height: 85px;
        padding: 4px 4px 2px 0;
      }
    </style>

    <div id="container">
      <video
        id="video"
        controls\$="[[controls]]"
        width="[[width]]"
        height="[[height]]"
        preload="[[preload]]"
        poster="[[poster]]">
        <dom-repeat items="[[sources]]" as="source">
          <template>
            <source src="[[source.data]]" type="[[source.type]]">
          </template>
        </dom-repeat>
      </video>

      <dom-if if="[[_hasStoryboard(storyboard)]]">
        <template>
          <div id="storyboard">
            <div id="thumbnails">
              <dom-repeat items="[[storyboard]]" as="thumbnail">
                <template>
                  <img class="thumbnail" on-click="_jumpTo" src="[[thumbnail.content.data]]">
                </template>
              </dom-repeat>
            </div>
          </div>
        </template>
      </dom-if>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-video-viewer';
    }

    static get properties() {
      return {
        /**
         * The `preload` attribute specifies if/how the video should be loaded.
         */
        preload: {
          type: String,
          value: 'auto',
        },

        /**
         * If true, controls for the user to interact with are displayed.
         */
        controls: {
          type: Boolean,
          value: false,
        },

        /**
         * The `poster` attribute specifies an image shown while downloading.
         */
        poster: String,

        /**
         * The `sources` to be displayed.
         */
        sources: Object,

        /**
         * The storyboard (array of thumbnails) for video navigation. If null or empty, the storyboard is not shown.
         */
        storyboard: {
          type: Array,
          value: [],
        },
      };
    }

    play() {
      this.$.video.play();
    }

    stop() {
      this.$.video.pause();
      this.$.video.currentTime = 0;
    }

    pause() {
      this.$.video.pause();
    }

    isPaused() {
      return this.$.video.paused;
    }

    _hasStoryboard() {
      const hasStoryboard = this.storyboard && this.storyboard.length > 0;
      if (hasStoryboard) {
        this.$.video.classList.add('hasStoryboard');
      } else {
        this.$.video.classList.remove('hasStoryboard');
      }
      return hasStoryboard;
    }

    _jumpTo(e) {
      this.$.video.currentTime = e.model.thumbnail.timecode;
    }
  }

  customElements.define(VideoViewer.is, VideoViewer);
  Nuxeo.VideoViewer = VideoViewer;
}
