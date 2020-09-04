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

/*
  Styles module to be used by nuxeo buttons
*/
const template = html`
  <dom-module id="nuxeo-button-styles">
    <template>
      <style>
        paper-button.primary {
          @apply --nx-button-primary;
        }

        paper-button.primary:hover,
        paper-button.primary:focus {
          @apply --nx-button-primary-hover;
        }

        paper-button[disabled] {
          @apply --nx-button-disabled;
        }

        paper-button.secondary {
          @apply --nx-button-secondary;
        }

        paper-button.secondary:hover,
        paper-button.secondary:focus {
          @apply --nx-button-secondary-hover;
        }

        paper-button.secondary[disabled] {
          @apply --nx-button-secondary-disabled;
        }

        paper-button.text {
          @apply --nx-button-text;
        }

        paper-button.text:hover,
        paper-button.text:focus {
          @apply --nx-button-text-hover;
        }

        paper-button.text[disabled] {
          @apply --nx-button-text-disabled;
        }

        paper-button.small {
          @apply --nx-button-small;
        }

        paper-button iron-icon {
          @apply --nx-button-icon;
        }

        paper-button.horizontal-button iron-icon + span {
          margin-inline-start: var(--nuxeo-button-icon-margin, 4px);
        }

        paper-button.horizontal-button span ~ iron-icon {
          margin-inline-start: var(--nuxeo-button-icon-margin, 4px);
        }

        paper-button.vertical-button iron-icon + span {
          margin-block-start: var(--nuxeo-button-icon-margin, 4px);
        }

        paper-button.vertical-button span ~ iron-icon {
          margin-block-start: var(--nuxeo-button-icon-margin, 4px);
        }
      </style>
    </template>
  </dom-module>
`;

document.head.appendChild(template.content);
