import{h as f,m as w,D as v,t as x,b as _}from"./iframe-Yfd-OibJ.js";import"./nuxeo-document-picker-CyZw9O_C.js";import{I as y}from"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-BVnGG85N.js";import"./iron-flex-layout-Db70X-7Q.js";import"./iron-collapse-BgVbqnqa.js";import"./iron-resizable-behavior-D7uxPWIp.js";import"./nuxeo-search-form-layout-D5sySwmr.js";import"./nuxeo-layout-BiYla9Cl.js";import"./nuxeo-search-results-layout-D5Tr1o0A.js";import"./nuxeo-dialog-Dw_pdDpA.js";import"./paper-material-styles-C_zSstGc.js";import"./shadow-5Ga7wkF4.js";import"./paper-ripple-DDInChqF.js";import"./iron-a11y-keys-behavior-BQM3k0wN.js";import"./paper-inky-focus-behavior-BHRRPMpt.js";import"./neon-animation-runner-behavior-BtBYKrDJ.js";import"./default-theme-DZcntQFC.js";import"./typography-C7rYHizi.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-vG_cb1KN.js";import"./paper-icon-button-D9_twpz5.js";import"./iron-icon-DGiq-Trn.js";/**
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
*/const E=f`
  <dom-module id="quill-snow">
    <template>
      <style>
        /*!
 * Quill Editor v2.0.0-dev.3
 * https://quilljs.com/
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 */
        .ql-container {
          box-sizing: border-box;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 13px;
          height: 100%;
          margin: 0px;
          position: relative;
        }
        .ql-container.ql-disabled .ql-tooltip {
          visibility: hidden;
        }
        .ql-container:not(.ql-disabled) li[data-list='checked'] > .ql-ui,
        .ql-container:not(.ql-disabled) li[data-list='unchecked'] > .ql-ui {
          cursor: pointer;
        }
        .ql-clipboard {
          left: -100000px;
          height: 1px;
          overflow-y: hidden;
          position: absolute;
          top: 50%;
        }
        .ql-clipboard p {
          margin: 0;
          padding: 0;
        }
        .ql-editor {
          box-sizing: border-box;
          counter-reset: list-0;
          line-height: 1.42;
          height: 100%;
          outline: none;
          overflow-y: auto;
          padding: 12px 15px;
          tab-size: 4;
          -moz-tab-size: 4;
          text-align: left;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        :host([dir='rtl']) .ql-editor {
          direction: rtl;
          text-align: right;
        }
        .ql-editor > * {
          cursor: text;
        }
        .ql-editor p,
        .ql-editor ol,
        .ql-editor pre,
        .ql-editor blockquote,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6 {
          margin: 0;
          padding: 0;
        }
        .ql-editor p,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6 {
          counter-reset: list-0 list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor table {
          border-collapse: collapse;
        }
        .ql-editor td {
          border: 1px solid #000;
          padding: 2px 5px;
        }
        .ql-editor ol {
          padding-left: 1.5em;
        }
        .ql-editor li {
          list-style-type: none;
          padding-left: 1.5em;
          position: relative;
        }
        .ql-editor li > .ql-ui:before {
          display: inline-block;
          margin-left: -1.5em;
          margin-right: 0.3em;
          text-align: right;
          white-space: nowrap;
          width: 1.2em;
        }
        :host([dir='rtl']) .ql-editor li > .ql-ui:before {
          margin-left: 0;
          margin-right: -1.5em;
          text-align: left;
        }
        .ql-editor li[data-list='checked'] > .ql-ui,
        .ql-editor li[data-list='unchecked'] > .ql-ui {
          color: #777;
        }
        .ql-editor li[data-list='bullet'] > .ql-ui:before {
          content: '\\2022';
        }
        .ql-editor li[data-list='checked'] > .ql-ui:before {
          content: '\\2611';
        }
        .ql-editor li[data-list='unchecked'] > .ql-ui:before {
          content: '\\2610';
        }
        .ql-editor li[data-list='ordered'] {
          counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
          counter-increment: list-0;
        }
        .ql-editor li[data-list='ordered'] > .ql-ui:before {
          content: counter(list-0, decimal) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-1 {
          counter-increment: list-1;
        }
        .ql-editor li[data-list='ordered'].ql-indent-1 > .ql-ui:before {
          content: counter(list-1, lower-alpha) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-1 {
          counter-reset: list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-2 {
          counter-increment: list-2;
        }
        .ql-editor li[data-list='ordered'].ql-indent-2 > .ql-ui:before {
          content: counter(list-2, lower-roman) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-2 {
          counter-reset: list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-3 {
          counter-increment: list-3;
        }
        .ql-editor li[data-list='ordered'].ql-indent-3 > .ql-ui:before {
          content: counter(list-3, decimal) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-3 {
          counter-reset: list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-4 {
          counter-increment: list-4;
        }
        .ql-editor li[data-list='ordered'].ql-indent-4 > .ql-ui:before {
          content: counter(list-4, lower-alpha) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-4 {
          counter-reset: list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-5 {
          counter-increment: list-5;
        }
        .ql-editor li[data-list='ordered'].ql-indent-5 > .ql-ui:before {
          content: counter(list-5, lower-roman) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-5 {
          counter-reset: list-6 list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-6 {
          counter-increment: list-6;
        }
        .ql-editor li[data-list='ordered'].ql-indent-6 > .ql-ui:before {
          content: counter(list-6, decimal) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-6 {
          counter-reset: list-7 list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-7 {
          counter-increment: list-7;
        }
        .ql-editor li[data-list='ordered'].ql-indent-7 > .ql-ui:before {
          content: counter(list-7, lower-alpha) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-7 {
          counter-reset: list-8 list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-8 {
          counter-increment: list-8;
        }
        .ql-editor li[data-list='ordered'].ql-indent-8 > .ql-ui:before {
          content: counter(list-8, lower-roman) '. ';
        }
        .ql-editor li[data-list='ordered'].ql-indent-8 {
          counter-reset: list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-9 {
          counter-increment: list-9;
        }
        .ql-editor li[data-list='ordered'].ql-indent-9 > .ql-ui:before {
          content: counter(list-9, decimal) '. ';
        }
        .ql-editor .ql-indent-1:not(.ql-direction-rtl) {
          padding-left: 3em;
        }
        .ql-editor li.ql-indent-1:not(.ql-direction-rtl) {
          padding-left: 4.5em;
        }
        .ql-editor .ql-indent-1.ql-direction-rtl.ql-align-right {
          padding-right: 3em;
        }
        .ql-editor li.ql-indent-1.ql-direction-rtl.ql-align-right {
          padding-right: 4.5em;
        }
        .ql-editor .ql-indent-2:not(.ql-direction-rtl) {
          padding-left: 6em;
        }
        .ql-editor li.ql-indent-2:not(.ql-direction-rtl) {
          padding-left: 7.5em;
        }
        .ql-editor .ql-indent-2.ql-direction-rtl.ql-align-right {
          padding-right: 6em;
        }
        .ql-editor li.ql-indent-2.ql-direction-rtl.ql-align-right {
          padding-right: 7.5em;
        }
        .ql-editor .ql-indent-3:not(.ql-direction-rtl) {
          padding-left: 9em;
        }
        .ql-editor li.ql-indent-3:not(.ql-direction-rtl) {
          padding-left: 10.5em;
        }
        .ql-editor .ql-indent-3.ql-direction-rtl.ql-align-right {
          padding-right: 9em;
        }
        .ql-editor li.ql-indent-3.ql-direction-rtl.ql-align-right {
          padding-right: 10.5em;
        }
        .ql-editor .ql-indent-4:not(.ql-direction-rtl) {
          padding-left: 12em;
        }
        .ql-editor li.ql-indent-4:not(.ql-direction-rtl) {
          padding-left: 13.5em;
        }
        .ql-editor .ql-indent-4.ql-direction-rtl.ql-align-right {
          padding-right: 12em;
        }
        .ql-editor li.ql-indent-4.ql-direction-rtl.ql-align-right {
          padding-right: 13.5em;
        }
        .ql-editor .ql-indent-5:not(.ql-direction-rtl) {
          padding-left: 15em;
        }
        .ql-editor li.ql-indent-5:not(.ql-direction-rtl) {
          padding-left: 16.5em;
        }
        .ql-editor .ql-indent-5.ql-direction-rtl.ql-align-right {
          padding-right: 15em;
        }
        .ql-editor li.ql-indent-5.ql-direction-rtl.ql-align-right {
          padding-right: 16.5em;
        }
        .ql-editor .ql-indent-6:not(.ql-direction-rtl) {
          padding-left: 18em;
        }
        .ql-editor li.ql-indent-6:not(.ql-direction-rtl) {
          padding-left: 19.5em;
        }
        .ql-editor .ql-indent-6.ql-direction-rtl.ql-align-right {
          padding-right: 18em;
        }
        .ql-editor li.ql-indent-6.ql-direction-rtl.ql-align-right {
          padding-right: 19.5em;
        }
        .ql-editor .ql-indent-7:not(.ql-direction-rtl) {
          padding-left: 21em;
        }
        .ql-editor li.ql-indent-7:not(.ql-direction-rtl) {
          padding-left: 22.5em;
        }
        .ql-editor .ql-indent-7.ql-direction-rtl.ql-align-right {
          padding-right: 21em;
        }
        .ql-editor li.ql-indent-7.ql-direction-rtl.ql-align-right {
          padding-right: 22.5em;
        }
        .ql-editor .ql-indent-8:not(.ql-direction-rtl) {
          padding-left: 24em;
        }
        .ql-editor li.ql-indent-8:not(.ql-direction-rtl) {
          padding-left: 25.5em;
        }
        .ql-editor .ql-indent-8.ql-direction-rtl.ql-align-right {
          padding-right: 24em;
        }
        .ql-editor li.ql-indent-8.ql-direction-rtl.ql-align-right {
          padding-right: 25.5em;
        }
        .ql-editor .ql-indent-9:not(.ql-direction-rtl) {
          padding-left: 27em;
        }
        .ql-editor li.ql-indent-9:not(.ql-direction-rtl) {
          padding-left: 28.5em;
        }
        .ql-editor .ql-indent-9.ql-direction-rtl.ql-align-right {
          padding-right: 27em;
        }
        .ql-editor li.ql-indent-9.ql-direction-rtl.ql-align-right {
          padding-right: 28.5em;
        }
        .ql-editor li.ql-direction-rtl {
          padding-right: 1.5em;
        }
        .ql-editor li.ql-direction-rtl > .ql-ui:before {
          margin-left: 0.3em;
          margin-right: -1.5em;
          text-align: left;
        }
        .ql-editor table {
          table-layout: fixed;
          width: 100%;
        }
        .ql-editor table td {
          outline: none;
        }
        .ql-editor .ql-code-block-container {
          font-family: monospace;
        }
        .ql-editor .ql-video {
          display: block;
          max-width: 100%;
        }
        .ql-editor .ql-video.ql-align-center {
          margin: 0 auto;
        }
        .ql-editor .ql-video.ql-align-right {
          margin: 0 0 0 auto;
        }
        .ql-editor .ql-bg-black {
          background-color: #000;
        }
        .ql-editor .ql-bg-red {
          background-color: #e60000;
        }
        .ql-editor .ql-bg-orange {
          background-color: #f90;
        }
        .ql-editor .ql-bg-yellow {
          background-color: #ff0;
        }
        .ql-editor .ql-bg-green {
          background-color: #008a00;
        }
        .ql-editor .ql-bg-blue {
          background-color: #06c;
        }
        .ql-editor .ql-bg-purple {
          background-color: #93f;
        }
        .ql-editor .ql-color-white {
          color: #fff;
        }
        .ql-editor .ql-color-red {
          color: #e60000;
        }
        .ql-editor .ql-color-orange {
          color: #f90;
        }
        .ql-editor .ql-color-yellow {
          color: #ff0;
        }
        .ql-editor .ql-color-green {
          color: #008a00;
        }
        .ql-editor .ql-color-blue {
          color: #06c;
        }
        .ql-editor .ql-color-purple {
          color: #93f;
        }
        .ql-editor .ql-font-serif {
          font-family: Georgia, Times New Roman, serif;
        }
        .ql-editor .ql-font-monospace {
          font-family: Monaco, Courier New, monospace;
        }
        .ql-editor .ql-size-small {
          font-size: 0.75em;
        }
        .ql-editor .ql-size-large {
          font-size: 1.5em;
        }
        .ql-editor .ql-size-huge {
          font-size: 2.5em;
        }
        .ql-editor .ql-direction-rtl {
          direction: rtl;
          text-align: inherit;
        }
        .ql-editor .ql-align-center {
          text-align: center;
        }
        .ql-editor .ql-align-justify {
          text-align: justify;
        }
        .ql-editor .ql-align-right {
          text-align: right;
        }
        .ql-editor .ql-ui {
          position: absolute;
        }
        .ql-editor.ql-blank::before {
          color: rgba(0, 0, 0, 0.6);
          content: attr(data-placeholder);
          font-style: italic;
          left: 15px;
          pointer-events: none;
          position: absolute;
          right: 15px;
        }
        .ql-snow.ql-toolbar:after,
        .ql-snow .ql-toolbar:after {
          clear: both;
          content: '';
          display: table;
        }
        .ql-snow.ql-toolbar button,
        .ql-snow .ql-toolbar button {
          background: none;
          border: none;
          cursor: pointer;
          display: inline-block;
          float: left;
          height: 24px;
          padding: 3px 5px;
          width: 28px;
        }
        .ql-snow.ql-toolbar button svg,
        .ql-snow .ql-toolbar button svg {
          float: left;
          height: 100%;
        }
        .ql-snow.ql-toolbar button:active:hover,
        .ql-snow .ql-toolbar button:active:hover {
          outline: none;
        }
        .ql-snow.ql-toolbar input.ql-image[type='file'],
        .ql-snow .ql-toolbar input.ql-image[type='file'] {
          display: none;
        }
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button:focus,
        .ql-snow .ql-toolbar button:focus,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active,
        .ql-snow.ql-toolbar .ql-picker-label:hover,
        .ql-snow .ql-toolbar .ql-picker-label:hover,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active,
        .ql-snow.ql-toolbar .ql-picker-item:hover,
        .ql-snow .ql-toolbar .ql-picker-item:hover,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
          color: #06c;
        }
        .ql-snow.ql-toolbar button:hover .ql-fill,
        .ql-snow .ql-toolbar button:hover .ql-fill,
        .ql-snow.ql-toolbar button:focus .ql-fill,
        .ql-snow .ql-toolbar button:focus .ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .ql-snow .ql-toolbar button.ql-active .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
        .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
          fill: #06c;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow .ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button:focus .ql-stroke,
        .ql-snow .ql-toolbar button:focus .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
        .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
        .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
        .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
        .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
          stroke: #06c;
        }
        @media (pointer: coarse) {
          .ql-snow.ql-toolbar button:hover:not(.ql-active),
          .ql-snow .ql-toolbar button:hover:not(.ql-active) {
            color: #444;
          }
          .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-fill,
          .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-fill,
          .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill,
          .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill {
            fill: #444;
          }
          .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke,
          .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke,
          .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter,
          .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter {
            stroke: #444;
          }
        }
        .ql-snow {
          box-sizing: border-box;
        }
        .ql-snow * {
          box-sizing: border-box;
        }
        .ql-snow .ql-hidden {
          display: none;
        }
        .ql-snow .ql-out-bottom,
        .ql-snow .ql-out-top {
          visibility: hidden;
        }
        .ql-snow .ql-tooltip {
          position: absolute;
          transform: translateY(10px);
        }
        .ql-snow .ql-tooltip a {
          cursor: pointer;
          text-decoration: none;
        }
        .ql-snow .ql-tooltip.ql-flip {
          transform: translateY(-10px);
        }
        .ql-snow .ql-formats {
          display: inline-block;
          vertical-align: middle;
        }
        .ql-snow .ql-formats:after {
          clear: both;
          content: '';
          display: table;
        }
        .ql-snow .ql-stroke {
          fill: none;
          stroke: #444;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2;
        }
        .ql-snow .ql-stroke-miter {
          fill: none;
          stroke: #444;
          stroke-miterlimit: 10;
          stroke-width: 2;
        }
        .ql-snow .ql-fill,
        .ql-snow .ql-stroke.ql-fill {
          fill: #444;
        }
        .ql-snow .ql-empty {
          fill: none;
        }
        .ql-snow .ql-even {
          fill-rule: evenodd;
        }
        .ql-snow .ql-thin,
        .ql-snow .ql-stroke.ql-thin {
          stroke-width: 1;
        }
        .ql-snow .ql-transparent {
          opacity: 0.4;
        }
        .ql-snow .ql-direction svg:last-child {
          display: none;
        }
        .ql-snow .ql-direction.ql-active svg:last-child {
          display: inline;
        }
        .ql-snow .ql-direction.ql-active svg:first-child {
          display: none;
        }
        .ql-snow .ql-editor h1 {
          font-size: 2em;
        }
        .ql-snow .ql-editor h2 {
          font-size: 1.5em;
        }
        .ql-snow .ql-editor h3 {
          font-size: 1.17em;
        }
        .ql-snow .ql-editor h4 {
          font-size: 1em;
        }
        .ql-snow .ql-editor h5 {
          font-size: 0.83em;
        }
        .ql-snow .ql-editor h6 {
          font-size: 0.67em;
        }
        .ql-snow .ql-editor a {
          text-decoration: underline;
        }
        .ql-snow .ql-editor blockquote {
          border-left: 4px solid #ccc;
          margin-bottom: 5px;
          margin-top: 5px;
          padding-left: 16px;
        }
        .ql-snow .ql-editor code,
        .ql-snow .ql-editor .ql-code-block-container {
          background-color: #f0f0f0;
          border-radius: 3px;
        }
        .ql-snow .ql-editor .ql-code-block-container {
          margin-bottom: 5px;
          margin-top: 5px;
          padding: 5px 10px;
        }
        .ql-snow .ql-editor code {
          font-size: 85%;
          padding: 2px 4px;
        }
        .ql-snow .ql-editor .ql-code-block-container {
          background-color: #23241f;
          color: #f8f8f2;
          overflow: visible;
        }
        .ql-snow .ql-editor img {
          max-width: 100%;
        }
        .ql-snow .ql-picker {
          color: #444;
          display: inline-block;
          float: left;
          font-size: 14px;
          font-weight: 500;
          height: 24px;
          position: relative;
          vertical-align: middle;
        }
        .ql-snow .ql-picker-label {
          cursor: pointer;
          display: inline-block;
          height: 100%;
          padding-left: 8px;
          padding-right: 2px;
          position: relative;
          width: 100%;
        }
        .ql-snow .ql-picker-label::before {
          display: inline-block;
          line-height: 22px;
        }
        .ql-snow .ql-picker-options {
          background-color: #fff;
          display: none;
          min-width: 100%;
          padding: 4px 8px;
          position: absolute;
          white-space: nowrap;
        }
        .ql-snow .ql-picker-options .ql-picker-item {
          cursor: pointer;
          display: block;
          padding-bottom: 5px;
          padding-top: 5px;
        }
        .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          color: #ccc;
          z-index: 2;
        }
        .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
          fill: #ccc;
        }
        .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
          stroke: #ccc;
        }
        .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          display: block;
          margin-top: -1px;
          top: 100%;
          z-index: 1;
        }
        .ql-snow .ql-color-picker,
        .ql-snow .ql-icon-picker {
          width: 28px;
        }
        .ql-snow .ql-color-picker .ql-picker-label,
        .ql-snow .ql-icon-picker .ql-picker-label {
          padding: 2px 4px;
        }
        .ql-snow .ql-color-picker .ql-picker-label svg,
        .ql-snow .ql-icon-picker .ql-picker-label svg {
          right: 4px;
        }
        .ql-snow .ql-icon-picker .ql-picker-options {
          padding: 4px 0px;
        }
        .ql-snow .ql-icon-picker .ql-picker-item {
          height: 24px;
          width: 24px;
          padding: 2px 4px;
        }
        .ql-snow .ql-color-picker .ql-picker-options {
          padding: 3px 5px;
          width: 152px;
        }
        .ql-snow .ql-color-picker .ql-picker-item {
          border: 1px solid transparent;
          float: left;
          height: 16px;
          margin: 2px;
          padding: 0px;
          width: 16px;
        }
        .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
          position: absolute;
          margin-top: -9px;
          right: 0;
          top: 50%;
          width: 18px;
        }
        :host([dir='rtl']) .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
          left: 0;
          right: auto;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-label]:not([data-label=''])::before,
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-label]:not([data-label=''])::before,
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-label]:not([data-label=''])::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-label]:not([data-label=''])::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-label]:not([data-label=''])::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-label]:not([data-label=''])::before {
          content: attr(data-label);
        }
        .ql-snow .ql-picker.ql-header {
          width: 98px;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          content: 'Normal';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
          content: 'Heading 1';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
          content: 'Heading 2';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
          content: 'Heading 3';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
          content: 'Heading 4';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
          content: 'Heading 5';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
          content: 'Heading 6';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
          font-size: 2em;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
          font-size: 1.5em;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
          font-size: 1.17em;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
          font-size: 1em;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
          font-size: 0.83em;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
          font-size: 0.67em;
        }
        .ql-snow .ql-picker.ql-font {
          width: 108px;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item::before {
          content: 'Sans Serif';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
          content: 'Serif';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
          content: 'Monospace';
        }
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
          font-family: Georgia, Times New Roman, serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
          font-family: Monaco, Courier New, monospace;
        }
        .ql-snow .ql-picker.ql-size {
          width: 98px;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: 'Normal';
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
          content: 'Small';
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
          content: 'Large';
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
          content: 'Huge';
        }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
          font-size: 10px;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
          font-size: 18px;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
          font-size: 32px;
        }
        .ql-snow .ql-color-picker.ql-background .ql-picker-item {
          background-color: #fff;
        }
        .ql-snow .ql-color-picker.ql-color .ql-picker-item {
          background-color: #000;
        }
        .ql-code-block-container {
          position: relative;
        }
        .ql-code-block-container .ql-ui {
          right: 5px;
          top: 5px;
        }
        .ql-toolbar.ql-snow {
          border: 1px solid #ccc;
          box-sizing: border-box;
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
          padding: 8px;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 15px;
        }
        .ql-toolbar.ql-snow .ql-picker-label {
          border: 1px solid transparent;
        }
        .ql-toolbar.ql-snow .ql-picker-options {
          border: 1px solid transparent;
          box-shadow: rgba(0, 0, 0, 0.2) 0 2px 8px;
        }
        .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #ccc;
        }
        .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #ccc;
        }
        .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item.ql-selected,
        .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item:hover {
          border-color: #000;
        }
        .ql-toolbar.ql-snow + .ql-container.ql-snow {
          border-top: 0px;
        }
        .ql-snow .ql-tooltip {
          background-color: #fff;
          border: 1px solid #ccc;
          box-shadow: 0px 0px 5px #ddd;
          color: #444;
          padding: 5px 12px;
          white-space: nowrap;
        }
        .ql-snow .ql-tooltip::before {
          content: 'Visit URL:';
          line-height: 26px;
          margin-right: 8px;
        }
        .ql-snow .ql-tooltip input[type='text'] {
          display: none;
          border: 1px solid #ccc;
          font-size: 13px;
          height: 26px;
          margin: 0px;
          padding: 3px 5px;
          width: 170px;
        }
        .ql-snow .ql-tooltip a.ql-preview {
          display: inline-block;
          max-width: 200px;
          overflow-x: hidden;
          text-overflow: ellipsis;
          vertical-align: top;
        }
        .ql-snow .ql-tooltip a.ql-action::after {
          border-right: 1px solid #ccc;
          content: 'Edit';
          margin-left: 16px;
          padding-right: 8px;
        }
        .ql-snow .ql-tooltip a.ql-remove::before {
          content: 'Remove';
          margin-left: 8px;
        }
        .ql-snow .ql-tooltip a {
          line-height: 26px;
        }
        .ql-snow .ql-tooltip a.ql-action,
        .ql-snow .ql-tooltip a.ql-remove {
          cursor: pointer;
        }
        .ql-snow .ql-tooltip a:focus-visible,
        .ql-snow .ql-tooltip input[type='text']:focus-visible {
          outline: 2px solid #06c;
          outline-offset: 1px;
        }
        .ql-snow .ql-tooltip.ql-editing a.ql-preview,
        .ql-snow .ql-tooltip.ql-editing a.ql-remove {
          display: none;
        }
        .ql-snow .ql-tooltip.ql-editing input[type='text'] {
          display: inline-block;
        }
        .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
          border-right: 0px;
          content: 'Save';
          padding-right: 0px;
        }
        .ql-snow .ql-tooltip[data-mode='link']::before {
          content: 'Enter link:';
        }
        .ql-snow .ql-tooltip[data-mode='formula']::before {
          content: 'Enter formula:';
        }
        .ql-snow .ql-tooltip[data-mode='video']::before {
          content: 'Enter video:';
        }
        .ql-snow a {
          color: #06c;
        }
        /*
.ql-container.ql-snow {
  border: 1px solid #ccc;
}
*/
      </style>
    </template>
  </dom-module>
`;document.head.appendChild(E.content);/**
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
*/const C=7,N={"#000000":"htmlEditor.colorName.black","#e60000":"htmlEditor.colorName.red","#ff9900":"htmlEditor.colorName.orange","#ffff00":"htmlEditor.colorName.yellow","#008a00":"htmlEditor.colorName.green","#0066cc":"htmlEditor.colorName.blue","#9933ff":"htmlEditor.colorName.purple","#ffffff":"htmlEditor.colorName.white","#facccc":"htmlEditor.colorName.veryLightRed","#ffebcc":"htmlEditor.colorName.veryLightOrange","#ffffcc":"htmlEditor.colorName.veryLightYellow","#cce8cc":"htmlEditor.colorName.veryLightGreen","#cce0f5":"htmlEditor.colorName.veryLightBlue","#ebd6ff":"htmlEditor.colorName.veryLightPurple","#bbbbbb":"htmlEditor.colorName.lightGray","#f06666":"htmlEditor.colorName.lightRed","#ffc266":"htmlEditor.colorName.lightOrange","#ffff66":"htmlEditor.colorName.lightYellow","#66b966":"htmlEditor.colorName.lightGreen","#66a3e0":"htmlEditor.colorName.lightBlue","#c285ff":"htmlEditor.colorName.lightPurple","#888888":"htmlEditor.colorName.gray","#a10000":"htmlEditor.colorName.darkRed","#b26b00":"htmlEditor.colorName.darkOrange","#b2b200":"htmlEditor.colorName.darkYellow","#006100":"htmlEditor.colorName.darkGreen","#0047b2":"htmlEditor.colorName.darkBlue","#6b24b2":"htmlEditor.colorName.darkPurple","#444444":"htmlEditor.colorName.darkGray","#5c0000":"htmlEditor.colorName.veryDarkRed","#663d00":"htmlEditor.colorName.veryDarkOrange","#666600":"htmlEditor.colorName.veryDarkYellow","#003700":"htmlEditor.colorName.veryDarkGreen","#002966":"htmlEditor.colorName.veryDarkBlue","#3d1466":"htmlEditor.colorName.veryDarkPurple"};/**
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
*/{const g=a=>{if(/\s/.test(a))return!1;const t=a.indexOf("@",1);if(t===-1)return!1;const l=a.indexOf(".",t+2);return l!==-1&&l<a.length-1},k='a.ql-preview, input[type="text"], a.ql-action, a.ql-remove',p={link:{dialog:"htmlEditor.link.dialog",url:"htmlEditor.link.url",edit:"htmlEditor.link.edit",remove:"htmlEditor.link.remove",visit:"htmlEditor.link.visit",button:"button.ql-link"},video:{dialog:"htmlEditor.video.dialog",url:"htmlEditor.video.url",edit:"htmlEditor.video.edit",remove:"htmlEditor.video.remove",visit:"htmlEditor.video.visit",button:"button.ql-video"}};class b extends w([y],Nuxeo.Element){static get template(){return f`
        <style include="quill-snow">
          :host {
            display: flex;
            flex-direction: column;
            min-height: 30em;
          }

          #editor {
            outline: none;
            overflow: hidden;
            height: 100%;
          }

          div#editor > * {
            margin-top: 0;
            margin-bottom: 28px;
          }

          iron-icon {
            height: 18px;
            color: #444;
          }

          /* A swatch carries no content, so the browser default ring is a hairline against its own
             fill — invisible on the dark swatches. A dark outer ring plus a light inner edge stays
             perceivable whether the swatch is black or white. The inner edge is an inset shadow
             rather than a border color, which Quill already claims for the selected swatch. */
          .ql-snow .ql-color-picker .ql-picker-item:focus {
            box-shadow: inset 0 0 0 1px #fff;
            outline: 2px solid #1a1a1a;
            outline-offset: 1px;
          }
        </style>

        <nuxeo-document-picker
          id="picker"
          dialog-label="[[i18n('htmlEditor.insert.imagesFromDocuments')]]"
          provider="document_picker"
          page-size="40"
          schemas="dublincore,file"
          enrichers="thumbnail,permissions,highlight"
          search-name="document_picker"
          on-picked="_onPickerSelected"
        ></nuxeo-document-picker>

        <div id="toolbar">
          <span class="ql-formats">
            <select class="ql-header" title$="[[i18n('htmlEditor.header')]]">
              <option value="1"></option>
              <option value="2"></option>
              <option value="3"></option>
              <option value="4"></option>
              <option value="5"></option>
              <option value="6"></option>
              <option selected></option>
            </select>
          </span>
          <span class="ql-formats">
            <button class="ql-bold" title$="[[i18n('htmlEditor.bold')]]"></button>
            <button class="ql-italic" title$="[[i18n('htmlEditor.italic')]]"></button>
            <button class="ql-underline" title$="[[i18n('htmlEditor.underline')]]"></button>
            <button class="ql-strike" title$="[[i18n('htmlEditor.strike')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-blockquote" title$="[[i18n('htmlEditor.blockquote')]]"></button>
            <button class="ql-code-block" title$="[[i18n('htmlEditor.codeBlock')]]"></button>
            <button class="ql-indent" value="-1" title$="[[i18n('htmlEditor.indent.decrease')]]"></button>
            <button class="ql-indent" value="+1" title$="[[i18n('htmlEditor.indent.increase')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-align" value="" title$="[[i18n('htmlEditor.align.left')]]"></button>
            <button class="ql-align" value="center" title$="[[i18n('htmlEditor.align.center')]]"></button>
            <button class="ql-align" value="right" title$="[[i18n('htmlEditor.align.right')]]"></button>
          </span>
          <span class="ql-formats">
            <select class="ql-color" title$="[[i18n('htmlEditor.color')]]"></select>
            <select class="ql-background" title$="[[i18n('htmlEditor.backgroundColor')]]"></select>
          </span>
          <span class="ql-formats">
            <button class="ql-script" value="sub" title$="[[i18n('htmlEditor.subscript')]]"></button>
            <button class="ql-script" value="super" title$="[[i18n('htmlEditor.superscript')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-list" value="ordered" title$="[[i18n('htmlEditor.list.numbered')]]"></button>
            <button class="ql-list" value="bullet" title$="[[i18n('htmlEditor.list.bulleted')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-link" title$="[[i18n('htmlEditor.insert.link')]]"></button>
            <!-- hide the default Quill image upload button, then trigger it from the button with the custom icon -->
            <button
              id="qlImage"
              class="ql-image"
              style="display: none;"
              title$="[[i18n('htmlEditor.insert.image')]]"
            ></button>
            <button on-tap="_onImageUpload" title$="[[i18n('htmlEditor.insert.image')]]">
              <iron-icon icon="nuxeo:picture"></iron-icon>
            </button>
            <button
              on-tap="_onSearchImage"
              title$="[[i18n('htmlEditor.insert.imagesFromDocuments')]]"
              aria-haspopup="dialog"
            >
              <iron-icon icon="nuxeo:search-picture"></iron-icon>
            </button>
            <button class="ql-video" title$="[[i18n('htmlEditor.insert.video')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-clean" title$="[[i18n('htmlEditor.clearFormatting')]]"></button>
          </span>
        </div>

        <div id="editor"></div>
      `}static get is(){return"nuxeo-html-editor"}static get properties(){return{value:{type:String,notify:!0},placeholder:{type:String,value:"Type here..."},readOnly:{type:Boolean,value:!1,reflectToAttribute:!0},_editor:{type:Object}}}static get observers(){return["_valueChanged(value, _editor)","_readOnlyChanged(readOnly, _editor)","_colorPickerI18nChanged(i18n, _editor)"]}static get importMeta(){return import.meta}ready(){if(super.ready(),!this.hasAttribute("dir")){const o=document.documentElement.getAttribute("dir");this.setAttribute("dir",o)}const{placeholder:t,readOnly:l}=this,e={toolbar:{container:"#toolbar",handlers:{link:o=>this._onLinkAction(o)}}};this._editor=new Quill(this.$.editor,{theme:"snow",modules:e,placeholder:t,readOnly:l}),this._setupColorPickers(),this.getAttribute("dir")==="rtl"&&(this._editor.format("align","right"),this._editor.format("direction","rtl")),this._editor.on("text-change",()=>{this._debouncer=v.debounce(this._debouncer,x.after(200),()=>this._updateValue())}),this._setupTooltipAccessibility()}connectedCallback(){super.connectedCallback(),this._observeTooltip()}disconnectedCallback(){super.disconnectedCallback(),this._tooltipObserver&&(this._tooltipObserver.disconnect(),this._tooltipObserver=null)}_updateValue(){this._internalChange=!0,this.value=this._editor.getSemanticHTML(),this._internalChange=!1}_valueChanged(){if(this._editor&&!this._internalChange){const t=this._editor.clipboard.convert({html:this.value});this._editor.setContents(t,this.readOnly?Quill.sources.SILENT:Quill.sources.USER),this._editor.setSelection(0,Quill.sources.SILENT)}}_readOnlyChanged(){this._editor&&(this._editor.enable(!this.readOnly),this._editor.getModule("toolbar").container.style.display=this.readOnly?"none":"")}_onLinkAction(t){if(!t){this._editor.format("link",!1,Quill.sources.USER);return}const l=this._editor.getSelection(!0);if(!l||!this._tooltip)return;this._linkInsertRange=l.length===0?l:null;let e=l.length>0?this._editor.getText(l):"";g(e)&&e.indexOf("mailto:")!==0&&(e=`mailto:${e}`),this._tooltip.edit("link",e)}_setupTooltipAccessibility(){const{theme:t}=this._editor;if(!t)return;const{tooltip:l}=t;if(!l)return;const{root:e}=l;if(!e)return;this._tooltip=l,l.root.setAttribute("role","dialog"),l.root.querySelectorAll("a.ql-action, a.ql-remove").forEach(i=>{i.setAttribute("role","button"),i.setAttribute("tabindex","0")}),l.root.addEventListener("keydown",i=>this._onTooltipKeydown(i),!0);const{save:o}=l;l.save=()=>{const i=l.textbox.value,r=this._linkInsertRange;if(this._linkInsertRange=null,r&&i&&l.root.dataset.mode==="link"){this._editor.insertText(r.index,i,"link",i,Quill.sources.USER),this._editor.setSelection(r.index+i.length,Quill.sources.SILENT),l.textbox.value="",l.hide();return}o.call(l)},this._updateTooltipLabels(),this._observeTooltip()}_observeTooltip(){!this._tooltip||this._tooltipObserver||(this._tooltipObserver=new MutationObserver(()=>this._onTooltipStateChanged()),this._tooltipObserver.observe(this._tooltip.root,{attributes:!0,attributeFilter:["class","data-mode"]}))}_onTooltipStateChanged(){this._updateTooltipLabels();const t=this._isTooltipEditing();t&&!this._tooltipEditing&&(this._tooltip.textbox.focus(),this._tooltip.textbox.select()),this._tooltipEditing=t}_tooltipMode(){return p[this._tooltip.root.dataset.mode]||p.link}_updateTooltipLabels(){const{root:t}=this._tooltip,l=this._tooltipMode();t.setAttribute("aria-label",this.i18n(l.dialog)),this._tooltip.textbox.setAttribute("aria-label",this.i18n(l.url));const e=t.querySelector("a.ql-action"),o=t.querySelector("a.ql-remove"),i=t.querySelector("a.ql-preview");e&&e.setAttribute("aria-label",t.classList.contains("ql-editing")?this.i18n("htmlEditor.tooltip.save"):this.i18n(l.edit)),o&&o.setAttribute("aria-label",this.i18n(l.remove)),i&&i.setAttribute("aria-label",this.i18n(l.visit))}_isTooltipEditing(){const{classList:t}=this._tooltip.root;return!t.contains("ql-hidden")&&t.contains("ql-editing")}_onTooltipKeydown(t){if(this._tooltip.root.classList.contains("ql-hidden"))return;const l=t.composedPath()[0],e=l instanceof Element&&l.matches("a.ql-action, a.ql-remove");if(t.key==="Escape")t.preventDefault(),t.stopPropagation(),this._closeTooltip();else if((t.key==="Enter"||t.key===" ")&&e)t.preventDefault(),l.click();else if(t.key==="Tab"&&this._isTooltipEditing()){const o=this._visibleTooltipControls(),i=o.indexOf(l);if(o.length===0||i<0)return;t.preventDefault();const r=(i+(t.shiftKey?-1:1)+o.length)%o.length;o[r].focus()}}_visibleTooltipControls(){return Array.from(this._tooltip.root.querySelectorAll(k)).filter(t=>t.getClientRects().length>0)}_closeTooltip(){const l=this._tooltip.root.classList.contains("ql-editing")&&this.$.toolbar.querySelector(this._tooltipMode().button);l?l.focus():this._editor.focus(),this._tooltip.hide(),this._linkInsertRange=null}_onImageUpload(){this.$.qlImage.click()}_onSearchImage(){this.$.picker.open()}_onPickerSelected(t){const l=t.detail&&t.detail.selectedItems;if(l){const e=l.filter(o=>o.properties["file:content"]&&o.properties["file:content"].data).map(o=>`<img src="${o.properties["file:content"].data}">`).join(`
`);this._editor.clipboard.dangerouslyPasteHTML(this._editor.getSelection(!0).index,e),this._editor.focus()}}_colorPickers(){const{theme:t}=this._editor||{},{pickers:l}=t||{};return(l||[]).filter(e=>e.container.classList.contains("ql-color-picker"))}_setupColorPickers(){this._colorPickers().forEach(t=>this._setupColorPicker(t))}_colorPickerI18nChanged(){this._colorPickers().forEach(t=>this._labelColorPicker(t))}_labelColorPicker(t){const{options:l}=t,{name:e,fallback:o}=this._colorPickerLabels(t);l.setAttribute("aria-label",e),Array.from(l.children).forEach(i=>{const r=this._colorName(i.dataset.value,o);i.setAttribute("aria-label",r),i.setAttribute("title",r)}),this._syncColorPicker(t)}_setupColorPicker(t){const{container:l,label:e,options:o}=t;e.setAttribute("aria-haspopup","listbox"),o.setAttribute("role","listbox"),o.setAttribute("aria-orientation","horizontal"),Array.from(o.children).forEach(n=>n.setAttribute("role","option"));const{selectItem:i,togglePicker:r}=t;t.selectItem=(n,s)=>{const q=s&&this._hasColorItemFocus(t);i.call(t,n,s),this._syncColorPicker(t),q&&e.focus()},t.togglePicker=()=>{r.call(t),this._syncColorPicker(t),t.container.classList.contains("ql-expanded")&&setTimeout(()=>{this.isConnected&&t.container.classList.contains("ql-expanded")&&!this._hasColorItemFocus(t)&&this._focusSelectedColorItem(t)})},e.addEventListener("keydown",n=>this._onColorLabelKeydown(t,n)),o.addEventListener("keydown",n=>this._onColorOptionKeydown(t,n)),l.addEventListener("focusout",n=>{l.classList.contains("ql-expanded")&&!l.contains(n.relatedTarget)&&t.close()}),this._labelColorPicker(t)}_colorPickerLabels(t){const l=t.container.classList.contains("ql-background");return{name:this.i18n(l?"htmlEditor.backgroundColor":"htmlEditor.color"),fallback:this.i18n(l?"htmlEditor.colorPicker.noBackground":"htmlEditor.colorPicker.automatic")}}_colorName(t,l){if(!t)return l;const e=N[t.toLowerCase()];return e?this.i18n(e):t}_syncColorPicker(t){const{label:l,options:e}=t,{name:o,fallback:i}=this._colorPickerLabels(t),r=Array.from(e.children),n=e.querySelector(".ql-picker-item.ql-selected"),s=n||r[0];r.forEach(d=>{d.setAttribute("aria-selected",String(d===n)),d.tabIndex=d===s?0:-1});const q=n?this._colorName(n.dataset.value,i):null;l.setAttribute("aria-label",q===null?o:this.i18n("htmlEditor.colorPicker.selected",o,q))}_hasColorItemFocus(t){const{activeElement:l}=this.shadowRoot||{};return!!l&&t.options.contains(l)}_focusColorItem(t,l){const e=t[l];e&&(t.forEach(o=>{o.tabIndex=o===e?0:-1}),e.focus())}_onColorLabelKeydown(t,l){["Enter"," ","ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(l.key)&&(l.key!=="Enter"&&(l.preventDefault(),t.container.classList.contains("ql-expanded")||t.togglePicker()),t.container.classList.contains("ql-expanded")&&this._focusSelectedColorItem(t))}_focusSelectedColorItem(t){const l=Array.from(t.options.children);this._focusColorItem(l,Math.max(0,l.indexOf(t.options.querySelector(".ql-selected"))))}_onColorOptionKeydown(t,l){const e=Array.from(t.options.children),o=e.indexOf(l.target);if(o<0)return;const i=Math.min(C,e.length);let r;switch(l.key){case"ArrowRight":r=o+1;break;case"ArrowLeft":r=o-1;break;case"ArrowDown":r=o+i;break;case"ArrowUp":r=o-i;break;case"Home":r=0;break;case"End":r=e.length-1;break;case"Enter":case" ":l.preventDefault(),e[o].click(),t.container.classList.contains("ql-expanded")&&(t.close(),t.label.focus());return;default:return}l.preventDefault(),r>=0&&r<e.length&&this._focusColorItem(e,r)}}customElements.define(b.is,b)}const X={title:"UI/nuxeo-html-editor"},c={render:()=>_`
    <style>
      .htmlEditor {
        margin: 20px;
        border: 1px solid #eee;
      }
    </style>
    <div class="htmlEditor">
      <nuxeo-html-editor> </nuxeo-html-editor>
    </div>
  `};var h,u,m;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      .htmlEditor {
        margin: 20px;
        border: 1px solid #eee;
      }
    </style>
    <div class="htmlEditor">
      <nuxeo-html-editor> </nuxeo-html-editor>
    </div>
  \`
}`,...(m=(u=c.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};const Z=["NuxeoHtmlEditor"];export{c as NuxeoHtmlEditor,Z as __namedExportsOrder,X as default};
