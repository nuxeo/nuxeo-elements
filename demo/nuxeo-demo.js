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
/* default routing */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';
import { XHRLocaleResolver } from '../nuxeo-i18n-behavior.js';
import './nuxeo-demo-theme.js';

RoutingBehavior.router = {
  baseUrl: '',
  useHashbang: true,
  browse() {
    return '#';
  },
  user() {
    return '#';
  },
  group() {
    return '#';
  },
};
/* default i18n */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
window.nuxeo.I18n.language = navigator.language || navigator.userLanguage || 'en';
window.nuxeo.I18n.localeResolver = new XHRLocaleResolver('../../i18n');
window.nuxeo.I18n.loadLocale();
/* demo helper elements */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
{
  class DemoSection extends PolymerElement {
    static get template() {
      return html`
    <style>
      :host {
        font-family: 'Open Sans', Arial, sans-serif;
        display: block;
      }

      :host([center]) #content {
        text-align: center;
      }

      #container {
        min-width: 480px;
        margin: 0 auto;
      }

      #heading {
        font-size: 20px;
        font-weight: 400;
        margin: 24px 0 8px;
      }

      #content {
        background-color: #efefef;
        border-radius: 3px;
        padding: 16px;
        margin-bottom: 16px;
      }
    </style>

    <div id="container">
      <template is="dom-if" if="[[heading]]"><div id="heading">[[heading]]</div></template>
      <div id="content">
        <slot></slot>
      </div>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-demo-section';
    }
    static get properties() {
      return {
        heading: {
          type: String,
        },
        center: {
          type: Boolean,
          value: false,
        },

        /**
         * Size of the section ('small', 'medium', 'large', 'full').
         */
        size: {
          type: String,
          value: 'medium',
          observer: '_sizeChanged',
        },

        _sizes: {
          type: Object,
          value: {
            small: '480px', medium: '768px', large: '960px', full: '100vw',
          },
        },
      };
    }

    _sizeChanged(size) {
      this.$.container.style.maxWidth = this._sizes[size];
    }
  }
  customElements.define(DemoSection.is, DemoSection);
}
