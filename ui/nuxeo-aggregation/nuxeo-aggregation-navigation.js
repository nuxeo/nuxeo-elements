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
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for providing aggregation based navigation.
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-aggregation-navigation/index.html
   */
  class AggregationNavigation extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 80px;
      }

      #keys {
        visibility: hidden;
        position: relative;
        height: calc(100% - 32px);
      }

      .key {
        position: absolute;
        right: 0;
        width: 64px;
        color: black;
        margin: 0;
        padding: 0 8px 0 0;
        font-size: 0.7rem;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: all;
        text-align: right;
        cursor: ns-resize;
      }

      #cursor {
        display: none;
        position: absolute;
        right: 0;
        width: 56px;
        height: 2px;
        background: rgba(0, 0, 0, 0.15);
        pointer-events: none;
      }

      #cursor .label {
        position: absolute;
        right: 56px;
        top: -14px;
        white-space: nowrap;
        text-align: center;
        background: black;
        color: white;
        padding: 6px 8px;
        font-size: 0.8rem;
        font-weight: bold;
        border-radius: 4px;
        min-width: 64px;
      }
    </style>

    <div id="keys" on-mouseout="_mouseOut" on-click="_tap">
      <dom-repeat items="[[_keys]]" as="key">
        <template>
          <div class="key" on-mousemove="_mouseMove"
            style\$="top: [[key.top]]px; height: [[key.height]]px; color: [[_color(key.visible)]];">
            [[_label(key)]]
          </div>
        </template>
      </dom-repeat>
      <div id="cursor">
        <div class="label">[[_cursorLabel]]</div>
      </div>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-aggregation-navigation';
    }

    static get properties() {
      return {
        buckets: {
          type: Array,
          value: [],
          observer: '_bucketsChanged',
        },

        granularity: {
          type: Number,
          value: 30,
        },

        opacity: {
          type: Number,
          value: 0.85,
        },

        _keys: {
          type: Array,
          value: [],
        },

        _count: {
          type: Number,
          value: 0,
        },

        _cursorIndex: {
          type: Number,
          value: 0,
        },

        _cursorLabel: {
          type: String,
          value: '',
        },

        _rect: {
          type: Object,
          value: {
            top: 0, right: 0, left: 0, bottom: 0,
          },
        },
      };
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('mouseover', () => {
        this._visibility(true);
      });

      this.addEventListener('mouseout', () => {
        this._visibility(false);
      });
    }

    _visibility(visible) {
      this.$.keys.style.visibility = visible ? 'visible' : 'hidden';
      this.style.background = visible ? 'rgba(255, 255, 255, 0.85)' : 'transparent';
    }

    _label(key) {
      return this.i18n(key.name);
    }

    _bucketsChanged(buckets) {
      this._rect = this.$.keys.getBoundingClientRect();

      // count documents in buckets
      this._count = 0;
      buckets.forEach((bucket) => {
        this._count += bucket.docCount;
      });
      this.style.opacity = this._count ? this.opacity : 0;

      // fill keys array based on buckets
      this.set('_keys', []);
      let offset = 1;
      let granularity = this.granularity;
      buckets.forEach((bucket) => {

        let visible = false;
        if (granularity >= this.granularity) {
          visible = true;
          granularity = 0;
        }

        const height = bucket.docCount * (this._rect.height / this._count);

        this.push('_keys', {
          name: bucket.key,
          offset,
          size: bucket.docCount,
          top: (offset * this._rect.height) / this._count,
          height,
          visible,
        });

        offset += bucket.docCount;
        granularity += height;

      });
    }

    _tap() {
      this.dispatchEvent(new CustomEvent('scroll-to', {
        composed: true,
        bubbles: true,
        detail: { index: this._cursorIndex },
      }));
    }

    _mouseMove(e) {
      const y = (e.y - this._rect.top);
      this.$.cursor.style.display = 'block';
      this.$.cursor.style.top = `${y}px`;
      this._cursorIndex = Math.round(this._count * y / this._rect.height);
      this._cursorLabel = this._label(e.model.key);
    }

    _mouseOut() {
      this.$.cursor.style.display = 'none';
    }

    _color(visible) {
      return visible ? 'black' : 'transparent';
    }
  }

  customElements.define(AggregationNavigation.is, AggregationNavigation);
  Nuxeo.AggregationNavigation = AggregationNavigation;
}
