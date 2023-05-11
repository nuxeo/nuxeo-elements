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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/*
### Styling

  Styles module to be used by elements related to document's comments feature, providing styles to common needs.
  The available custom properties and mixins for styling are the following:

  Custom property | Description | Default
  ----------------|-------------|----------
  `--nuxeo-comment-line-height` | Line height for comment's input area | 20
  `--nuxeo-comment-max-height`  | Maximum height for comment's input area | 80
  `--nuxeo-comment-placeholder-color` | Text color for comment's input area placeholder | #939caa
  `--nuxeo-comment-more-content-color` | Text color for the link to load more content (replies and comments) |  #1f28bf
*/

const template = html`
  <dom-module id="nuxeo-document-comments-styles">
    <template>
      <style>
        :host {
          display: block;
        }

        .horizontal {
          @apply --layout-horizontal;
        }

        .main-option {
          height: 1.5em;
          width: 1.5em;
          cursor: pointer;
        }

        .more-content {
          color: var(--nuxeo-comment-more-content-color, #1f28bf);
        }

        .no-selection {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .comment-iron-icon {
          margin: 0;
          padding: 0;
          background-color: transparent;
          border: none;
        }

        .opaque {
          opacity: 0.5;
        }

        .pointer {
          cursor: pointer;
        }

        .input-area {
          margin: 5px 0;

          @apply --layout-horizontal;
          @apply --layout-end;
        }

        .smaller {
          font-size: 0.86em;
        }

        paper-textarea {
          width: 100%;
          --paper-input-container-input: {
            font-size: 1em;
            line-height: var(--nuxeo-comment-line-height, 20px);
          }

          --iron-autogrow-textarea-placeholder: {
            color: var(--nuxeo-comment-placeholder-color, #939caa);
            font-size: 0.86em;
          }
        }
      </style>
    </template>
  </dom-module>
`;

document.head.appendChild(template.content);
