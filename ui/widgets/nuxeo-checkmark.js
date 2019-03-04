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
import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '../nuxeo-icons.js';

{
  /**
   * An element that displays a toggleable checkmark.
   *
   * ### Styling
   *
   * The following custom properties are available for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-checkmark-width` | Width | 18px
   * `--nuxeo-checkmark-height` | Height | 18px
   * `--nuxeo-checkmark-background-color` | Background color | transparent
   * `--nuxeo-checkmark-background-color-hover` | Background color on hover | transparent
   * `--nuxeo-checkmark-background-color-checked` | Background color on checked | --nuxeo-primary-color, blue
   * `--nuxeo-checkmark-border-color` | Border color | --nuxeo-border, gray
   * `--nuxeo-checkmark-border-color-hover` | Border color on hover | --nuxeo-border, gray
   * `--nuxeo-checkmark-border-color-checked` | Border color on checked | --nuxeo-primary-color, blue
   * `--nuxeo-checkmark-icon-color` | Icon color | transparent
   * `--nuxeo-checkmark-icon-color-hover` | Icon color on hover | black
   * `--nuxeo-checkmark-icon-color-checked` | Icon color on checked | white
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-checkmark/index.html
   */
  class CheckMark extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: inline-block;
        width: var(--nuxeo-checkmark-width, 18px);
        height: var(--nuxeo-checkmark-height, 18px);
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid var(--nuxeo-checkmark-border-color, var(--nuxeo-border, gray));
        background-color: var(--nuxeo-checkmark-background-color, transparent);
        color: var(--nuxeo-icon-color, transparent);
        padding: 0;
        margin: 0;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host(:focus) {
        outline: none;
      }

      :host(:hover) {
        border: 2px solid var(--nuxeo-checkmark-border-color, var(--nuxeo-border, gray));
        background-color: var(--nuxeo-checkmark-background-color-hover, transparent);
        color: var(--nuxeo-icon-color-hover, black);
      }

      :host([checked]) {
        border: 2px solid var(--nuxeo-checkmark-border-color-checked, var(--nuxeo-primary-color, blue));
        background-color: var(--nuxeo-checkmark-background-color-checked, var(--nuxeo-primary-color, blue));
        color: var(--nuxeo-icon-color-checked, white);
      }

      iron-icon {
        --iron-icon-width: 100%;
        --iron-icon-height: 100%;
        vertical-align: top;
      }
    </style>

    <iron-icon icon="nuxeo:check" on-click="_tap"></iron-icon>
`;
    }

    static get is() {
      return 'nuxeo-checkmark';
    }

    static get properties() {
      return {
        checked: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
        disabled: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
      };
    }

    _tap() {
      if (!this.disabled) {
        this.checked = !this.checked;
      }
    }
  }

  customElements.define(CheckMark.is, CheckMark);
  Nuxeo.CheckMark = CheckMark;
}
