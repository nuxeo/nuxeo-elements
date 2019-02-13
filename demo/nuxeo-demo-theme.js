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
import '@polymer/polymer/polymer-legacy.js';

const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase

$_documentContainer.innerHTML = `<custom-style>
  <style is="custom-style">

    html {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      font-size: 13px;
      line-height: 20px;

      --nuxeo-link: {
        color: var(--nuxeo-link-color);
        text-decoration: none;
      };

      --nuxeo-link-hover: {
        color: var(--nuxeo-link-hover-color);
        cursor: pointer;
      };

      --nuxeo-action: {
        border: 1px solid transparent;
        border-radius: 5em;
      };

      --nuxeo-action-hover: {
        border: 1px solid var(--nuxeo-primary-color);
        color: var(--nuxeo-text-default);
      };

      --nuxeo-block-hover: {
        background-color: var(--nuxeo-container-hover);
      };

      --nuxeo-block-selected: {
        background-color: var(--nuxeo-box);
        outline: 0;
        box-shadow: 5px 0 0 0 var(--nuxeo-primary-color) inset;
      };

      --nuxeo-card: {
        display: block;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 3px 5px rgba(0,0,0,0.04) !important;
        font-family: var(--nuxeo-app-font);
        border-radius: 0;
        background-color: var(--nuxeo-box) !important;
      };

      --nuxeo-label: {
        display: block;
        opacity: .6;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 400 !important;
        letter-spacing: 0.005em !important;
      };

      --nuxeo-tag: {
        display: inline-block;
        background-color: var(--nuxeo-tag-background);
        padding: .2rem .5rem;
        color: var(--nuxeo-tag-text);
        font-size: .8rem;
        letter-spacing: 0.02em;
        line-height: 1rem;
        margin-bottom: .3em;
        border-radius: 2em;
        text-decoration: none;
        vertical-align: baseline;
      };

      --nuxeo-user: {
        border-radius: 2.5em;
        text-transform: capitalize;
      };

      --nuxeo-dialog: {
        min-width: 480px;
      };

      --nuxeo-actions: {
        display: flex;
        margin: 1em 0;
      };

      --nuxeo-actions-button: {
        flex: 1;
      };

      --nuxeo-button-hover: {
        color: var(--nuxeo-link-hover-color);
      };

      --nuxeo-button-primary: {
        color: var(--nuxeo-button-primary-text);
        font-weight: 700;
        background-color: var(--nuxeo-button-primary);
      };

      --nuxeo-button-primary-hover: {
        color: var(--nuxeo-button-primary-text);
        background-color: var(--nuxeo-button-primary-focus);
      };

      --nuxeo-button-disabled: {
        color: var(--nuxeo-button-disabled-text);
        font-weight: normal;
        background-color: var(--nuxeo-button-disabled);
      };

      --buttons-bar: {
        background-color: var(--nuxeo-dialog-buttons-bar);
        padding: .7em 1.8em;
      };

      --iron-data-table: {
        font-family: var(--nuxeo-app-font);
      };

      --paper-tooltip: {
        font-size: 1rem;
        font-family: var(--nuxeo-app-font);
        background-color: var(--nuxeo-sidebar-background);
      };

      --paper-radio-button: {
        font-family: var(--nuxeo-app-font);
      };

      --paper-font-common-base: {
        font-family: var(--nuxeo-app-font);
      };

      --paper-tabs: {
        border-bottom: 1px solid var(--nuxeo-border);
      };

      --paper-icon-item: {
        color: var(--nuxeo-text-default);
        font-family: var(--nuxeo-app-font);
      };

      --paper-tab: {
        color: var(--nuxeo-text-default);
        font-family: var(--nuxeo-app-font);
      };

      --paper-item: {
        color: var(--nuxeo-text-default);
        font-family: var(--nuxeo-app-font);
        font-size: 1rem;
      };

      --paper-input: {
        color: var(--nuxeo-text-default);
        font-family: var(--nuxeo-app-font);
      };

      --paper-input-container: {
        color: var(--nuxeo-text-default);
        font-family: var(--nuxeo-app-font);
      };

      --paper-input-container-label: {
        font-family: var(--nuxeo-app-font);
        font-size: 1.35rem;
      };

      --paper-input-container-input: {
        font-family: var(--nuxeo-app-font);
      };

      --paper-input-container-label-focus: {
        color: var(--nuxeo-text-default);
      };

      --paper-dialog: {
        color: var(--nuxeo-text-default);
        background: var(--nuxeo-box);
        font-family: var(--nuxeo-app-font);
      };

      --paper-checkbox-label: {
        font-family: var(--nuxeo-app-font);
      };

      --paper-button: {
        font-family: var(--nuxeo-app-font);
        font-size: .8rem;
        color: var(--nuxeo-link-color);
        background-color: var(--nuxeo-button);
        border: 1px solid var(--nuxeo-border);
        border-radius: .1em;
        padding: .8em 2em;
        margin: 0;
      };

      --paper-button-ink-color: {
        color: var(--nuxeo-link-color);
      };

      --paper-button-flat-keyboard-focus: {
        background-color: var(--nuxeo-button-primary-focus);
        color: var(--nuxeo-button-primary-text);
        border-color: transparent;
      };

      --paper-button-raised-keyboard-focus: {
        background-color: var(--nuxeo-button-primary-focus);
        color: var(--nuxeo-button-primary-text);
        border-color: transparent;
      };
    }

    html, body {
      margin: 0;
      color: var(--nuxeo-text-default);
      font-family: var(--nuxeo-app-font);
      font-weight: 400;
    }

    /* headings */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 400;
    }

    h3 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 1em;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    /* links */
    a, a:active, a:visited, a:focus {
      @apply --nuxeo-link;
    }
    a:hover {
      @apply --nuxeo-link-hover;
    }

    /* label */
    label {
      @apply --nuxeo-label;
    }

    /* input */
    input,
    textarea {
      font-family: var(--nuxeo-app-font);
      font-size: 1rem !important;
    }

    paper-input[readonly] paper-input-container {
      opacity: .6;
    }

    paper-input[readonly] .input-content.label-is-highlighted label {
      color: var(--nuxeo-text-default);
      opacity: .6;
    }

    paper-input[readonly] .unfocused-line,
    paper-input[readonly] .focused-line {
      border-bottom: 1px dashed var(--nuxeo-text-default);
    }

    /* headings */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 400;
    }

    h3 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 1em;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    /* links */
    a, a:active, a:visited, a:focus {
      @apply --nuxeo-link;
    }
    a:hover {
      @apply --nuxeo-link-hover;
    }

    /* label */
    label {
      @apply --nuxeo-label;
    }

    /* paper-button */
    paper-button {
      min-width: 96px;
    }
    paper-button:hover {
      @apply --nuxeo-button-hover;
    }
    paper-button[primary] {
      @apply --nuxeo-button-primary;
      border-color: transparent;
    }
    paper-button[primary]:hover,
    paper-button[primary]:focus {
      @apply --nuxeo-button-primary-hover;
      border-color: transparent;
    }
    paper-button[disabled] {
      @apply --nuxeo-button-disabled;
    }
    paper-button + paper-button {
      margin-left: 8px;
    }

    /* -------------------------------------------------------------------------------
    /* DEFAULT THEME */

    html {
      /* -- Nuxeo Branding colors -- */
      --nuxeo-app-font: 'Open Sans', Arial, sans-serif;
      --nuxeo-text-default: #3a3a54;

      --nuxeo-primary-color: #0066ff;
      --nuxeo-secondary-color: #1f28bf;

      --nuxeo-page-background: #f5f5f5;
      --nuxeo-border: rgba(0,0,0,0.15);

      /* App Header */
      --nuxeo-app-header: var(--nuxeo-text-default);
      --nuxeo-app-header-background: #fff;
      --nuxeo-app-header-pill: #ecf3f7;
      --nuxeo-app-header-pill-hover: var(--nuxeo-primary-color);
      --nuxeo-app-header-pill-active: var(--nuxeo-secondary-color);

      /* Tags &amp; Pills */
      --nuxeo-tag-background: rgba(0,0,0,0.05);
      --nuxeo-tag-text: var(--nuxeo-text-default);
      --nuxeo-pill-filter-background: rgba(0,0,0,0.05);
      --nuxeo-pill-filter-background-active: var(--nuxeo-secondary-color);

      /* Boxes, Tables &amp; Listings */
      --nuxeo-box: #fff;
      --nuxeo-table-header-background: #fff;
      --nuxeo-table-items-background: #ffffff;
      --nuxeo-grid-selected: var(--nuxeo-primary-color);

      /* Buttons &amp; Links */
      --nuxeo-button: transparent;
      --nuxeo-button-primary: var(--nuxeo-primary-color);
      --nuxeo-button-primary-focus:var(--nuxeo-secondary-color);
      --nuxeo-button-primary-text: #ffffff;
      --nuxeo-button-disabled: rgba(0,0,0,.05);
      --nuxeo-button-disabled-text: rgba(0,0,0,.1);
      --nuxeo-link-color: var(--nuxeo-text-default);
      --nuxeo-link-hover-color: var(--nuxeo-primary-color);

      /* Custom Backgrounds */
      --nuxeo-container-hover: var(--nuxeo-page-background);
      --nuxeo-dialog-buttons-bar: rgba(0,0,0,0.05);

      /* Warn, Info, Error */
      --nuxeo-action-color-activated: #00aded;
      --nuxeo-toolbar: #191928;
      --nuxeo-warn-text: #fb6107;
      --nuxeo-validated: #99d749;
      --nuxeo-result-highlight: var(--nuxeo-primary-color);

      /*-- Polymer Variables --*/
      --default-primary-color: var(--nuxeo-primary-color);
      --dark-primary-color: #213f7d;
      --light-primary-color: #eff2f4;
      --text-primary-color: #ffffff;
      --accent-color: var(--nuxeo-primary-color);
      --primary-background-color: #eff2f4;
      --primary-text-color: #243238;
      --secondary-text-color: #939caa;
      --disabled-text-color: #bdbdbd;
      --divider-color: var(--nuxeo-border);

      /* Tabs, Toolbars &amp; Menus */
      --paper-tabs-selection-bar-color: var(--nuxeo-primary-color);
      --paper-tab-ink: var(--nuxeo-primary-color);

      --paper-toolbar-background: var(--nuxeo-box);
      --paper-toolbar-color: var(--nuxeo-text-default);

      --paper-menu-background-color: var(--nuxeo-box);
      --paper-menu-color: var(--nuxeo-text-default);
      --paper-menu-disabled-color: #e9eff3;

      /* Forms &amp; Buttons */
      --paper-checkbox-checked-color: var(--nuxeo-primary-color);
      --paper-checkbox-checked-ink-color: var(--nuxeo-primary-color);
      --paper-checkbox-unchecked-color: var(--nuxeo-text-default);
      --paper-checkbox-unchecked-ink-color: #6c6f7c;
      --paper-checkbox-label-color: var(--nuxeo-text-default);

      --paper-radio-button-checked-color: var(--nuxeo-primary-color);
      --paper-radio-button-checked-ink-color: #ffffff;
      --paper-radio-button-unchecked-color: var(--nuxeo-text-default);
      --paper-radio-button-unchecked-ink-color: #6c6f7c;
      --paper-radio-button-label-color: var(--nuxeo-text-default);

      --paper-input-container-color: var(--nuxeo-text-default);
      --paper-input-container-focus-color: var(--nuxeo-primary-color);
      --paper-input-container-invalid-color: #ff003c;
      --paper-input-container-input-color: var(--nuxeo-text-default);

      --paper-slider-knob-color: var(--nuxeo-primary-color);
      --paper-slider-active-color: var(--nuxeo-primary-color);
      --paper-slider-pin-color: var(--nuxeo-primary-color);

      --paper-toggle-button-checked-bar-color: var(--nuxeo-primary-color);
      --paper-toggle-button-checked-button-color: var(--nuxeo-primary-color);
      --paper-toggle-button-checked-ink-color: var(--nuxeo-primary-color);
      --paper-toggle-button-unchecked-bar-color: #6c6f7c;
      --paper-toggle-button-unchecked-button-color: #6c6f7c;
      --paper-toggle-button-unchecked-ink-color: #6c6f7c;

      --paper-fab-background: var(--nuxeo-primary-color);
      --paper-fab-disabled-background: #e9eff3;
      --paper-fab-disabled-text: #2f2b16;
      --paper-icon-button-disabled-text: #e9eff3;

      /* Loaders */
      --paper-progress-active-color: var(--nuxeo-primary-color);
      --paper-progress-secondary-color: var(--nuxeo-primary-color);

      --paper-spinner-layer-1-color: var(--nuxeo-primary-color);
      --paper-spinner-layer-2-color: rgba(79,230,221,.8);
      --paper-spinner-layer-3-color: #1f28bf;
      --paper-spinner-layer-4-color: var(--nuxeo-primary-color);
    }

  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
