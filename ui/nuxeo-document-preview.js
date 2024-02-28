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
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';

import '@polymer/marked-element/marked-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import './viewers/nuxeo-image-viewer.js';
import './viewers/nuxeo-pdf-viewer.js';
import './viewers/nuxeo-video-viewer.js';

{
  /**
   * An element to display a preview of a document.
   *
   * Example:
   *
   *     <nuxeo-document-preview document="[[document]]"></nuxeo-document-preview>
   *
   * @appliesMixin Polymer.Templatizer
   * @appliesMixin Polymer.IronResizableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-document-preview/index.html
   */
  class DocumentPreview extends mixinBehaviors([Templatizer, IronResizableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
          }

          nuxeo-image-viewer {
            width: 100%;
            height: 100%;
            min-height: var(--nuxeo-viewer-min-height, 60vh);
          }

          nuxeo-video-viewer {
            width: 100%;
            height: 100%;
          }

          audio {
            width: calc(100% - 16px);
            margin: 8px;
          }

          marked-element {
            background-color: white;
          }

          nuxeo-pdf-viewer {
            width: 100%;
            height: 100%;
            min-height: var(--nuxeo-viewer-min-height, 60vh);
          }

          object {
            height: 100%;
            min-height: var(--nuxeo-viewer-min-height, 60vh);
            width: 100%;
            border: none;
            padding: 0;
            margin: 0;
          }

          #xml {
            font-family: monospace;
          }

          #preview {
            border: none;
            width: 100%;
            height: 100%;
            overflow-wrap: break-word;
          }

          #plain {
            white-space: break-spaces;
          }
        </style>

        <!-- Our available preview templates. First match will be used -->
        <template mime-pattern="image.*|application/photoshop|illustrator|postscript">
          <nuxeo-image-viewer
            src="[[_computeImageSource(_blob)]]"
            controls
            responsive
            alt$="[[document.title]]"
          ></nuxeo-image-viewer>
        </template>

        <template mime-pattern="video.*|application/(g|m)xf">
          <nuxeo-video-viewer
            id="video"
            controls
            sources="[[_computeVideoSources(_blob)]]"
            storyboard="[[_computeStoryboard(_blob)]]"
          >
          </nuxeo-video-viewer>
        </template>

        <template mime-pattern="audio.*">
          <audio id="audio" controls>
            <source src="[[_computeAudioSource(_blob)]]" />
            AUDIO
          </audio>
        </template>

        <template mime-pattern="text/(?:.*-)?(markdown|html)">
          <marked-element markdown="[[_blob.text]]" sanitize></marked-element>
        </template>

        <template mime-pattern="text/plain">
          <div id="plain">[[_blob.text]]</div>
        </template>

        <template mime-pattern="text/xml">
          <div id="xml">[[_blob.text]]</div>
        </template>

        <template mime-pattern="application/pdf">
          <nuxeo-pdf-viewer src="[[_computePdfSource(_blob)]]"></nuxeo-pdf-viewer>
        </template>

        <template rendition="pdf">
          <nuxeo-pdf-viewer src="[[_computeRendition(document, xpath, 'pdf')]]"></nuxeo-pdf-viewer>
        </template>

        <template mime-pattern=".*">
          <object id="frame" data="[[_computeObjectSource(_blob)]]"></object>
        </template>

        <div id="preview"></div>
      `;
    }

    static get is() {
      return 'nuxeo-document-preview';
    }

    static get properties() {
      return {
        /**
         * Document
         */
        document: Object,

        /**
         * By default it will display a preview of the main file.
         * For example using `xpath="files:files/0/file"` will display the preview of the document's first attachment.
         */
        xpath: {
          type: String,
          value: 'file:content',
        },

        _blob: Object,
      };
    }

    static get observers() {
      return ['_updateBlob(document, xpath)'];
    }

    ready() {
      super.ready();
      this.addEventListener('iron-resize', this._onResize);
    }

    stop() {
      const video = this.$$('#video');
      if (video) {
        video.stop();
      }

      const audio = this.$$('#audio');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }

    _updateBlob() {
      if (this.document) {
        // adapt the Note to mimic a Blob
        if (this.document.schemas.find((schema) => schema.name === 'note') && this.xpath === 'file:content') {
          this._blob = {
            text: this.document.properties['note:note'],
            'mime-type': this.document.properties['note:mime_type'],
          };
        } else {
          // by default just use the field at xpath as a Blob
          this._blob = this.document && this._deepFind(this.document.properties, this.xpath);
        }
        // update our previewer
        this._updatePreview();
      }
    }

    _insertPreview(previewer) {
      delete previewer.__templatizeOwner;
      this.templatize(previewer);
      const instance = this.stamp();
      Object.keys(this.constructor.properties).forEach((prop) => instance._setPendingProperty(prop, this[prop]));
      instance._flushProperties();
      this.$.preview.appendChild(instance.root);
    }

    _updatePreview() {
      // clear current previewer
      while (this.$.preview.firstChild) {
        this.$.preview.removeChild(this.$.preview.firstChild);
      }

      // lookup the preview according to the blob's mimetype
      const previewers = dom(this.root).querySelectorAll('template');

      // Use embed preview when available
      if ('preview' in this._blob) {
        const fallback = previewers[previewers.length - 1];
        this._insertPreview(fallback);
        return;
      }

      for (let i = 0; i < previewers.length; i++) {
        const previewer = previewers[i];
        const mimetype = previewer.getAttribute('mime-pattern');
        const hasMimetype =
          mimetype &&
          new RegExp(mimetype).test(this._blob && this._blob['mime-type']) &&
          (!mimetype.startsWith('text/') || 'text' in this._blob);
        const rendition = previewer.getAttribute('rendition');
        const hasRendition = rendition && this._computeRendition(this.document, this.xpath, rendition);
        if (hasRendition || hasMimetype) {
          // Insert our previewer
          this._insertPreview(previewer);
          break;
        }
      }
    }

    _deepFind(obj, props) {
      for (let i = 0, path = props.split('/'), len = path.length; i < len; i++) {
        if (!obj || obj === []) {
          break;
        }
        obj = obj[path[i]];
      }
      if (!obj.viewUrl) {
        // this feature has not been implemented in 'view vs download', this would be implemented in WEBUI-1146.
        obj.viewUrl = obj.data;
      }
      return obj;
    }

    _computeImageSource() {
      if (
        this.document &&
        this.document.properties &&
        this.document.properties['picture:views'] &&
        this.xpath === 'file:content'
      ) {
        const filteredViews = this.document.properties['picture:views'].filter((view) => view.title === 'FullHD');
        if (filteredViews.length > 0) {
          const filteredViewsContent = filteredViews[0].content;
          return `${filteredViewsContent.viewUrl ? filteredViewsContent.viewUrl : filteredViewsContent.data}`;
        }
      }
      if (this.xpath) {
        if (this._blob && this._blob['mime-type'] && this._blob['mime-type'].match('image.*')) {
          return this._blob.viewUrl ? this._blob.viewUrl : this._blob.data;
        }
      }
    }

    _computeVideoSources() {
      if (
        this.document &&
        this.document.properties &&
        this.document.properties['vid:transcodedVideos'] &&
        this.xpath === 'file:content'
      ) {
        return this.document.properties['vid:transcodedVideos']
          .filter(
            (conversion) =>
              conversion &&
              conversion.content &&
              conversion.content.data &&
              conversion.content['mime-type'].match(/^video.*/),
          )
          .map((conversion) => {
            return {
              viewUrl: `${conversion.content.viewUrl}`,
              data: `${conversion.content.data}`,
              type: conversion.content['mime-type'],
            };
          });
      }
      // fallback to blob data if there are no transcoded videos (e.g. video documents managed by liveconnect)
      if (this.xpath) {
        if (this._blob && this._blob['mime-type'] && this._blob['mime-type'].match('video.*|application/(g|m)xf')) {
          return [
            {
              viewUrl: this._blob.viewUrl,
              data: this._blob.data,
              type: this._blob['mime-type'],
            },
          ];
        }
      }
    }

    _computeStoryboard() {
      if (
        this.document &&
        this.document.properties &&
        this.document.properties['vid:storyboard'] &&
        this.xpath === 'file:content'
      ) {
        return this.document.properties['vid:storyboard'];
      }
    }

    _computeAudioSource() {
      if (this._blob) {
        return this._blob.viewUrl ? this._blob.viewUrl : this._blob.data;
      }
    }

    _computeRendition(document, xpath, name) {
      const rendition =
        (xpath === 'file:content' || xpath.includes('files:files')) &&
        document &&
        document.contextParameters &&
        document.contextParameters.renditions &&
        document.contextParameters.renditions.find((r) => r.name === name);
      return rendition && (rendition.viewUrl ? rendition.viewUrl : rendition.url);
    }

    _computeObjectSource() {
      if (this.document && this.document.contextParameters && this.document.contextParameters.preview) {
        let { viewUrl } = this.document.contextParameters.preview;
        // this feature has not been implemented in 'view vs download', this would be implemented in WEBUI-1146.
        if (!viewUrl) {
          viewUrl = this.document.contextParameters.preview.url;
        }
        if (this.xpath !== 'file:content') {
          viewUrl = viewUrl.replace('/@preview/', `/@blob/${this.xpath}/@preview/`);
        }
        return viewUrl;
      }
      if (this._blob) {
        return this._blob.viewUrl ? this._blob.viewUrl : this._blob.url;
      }
    }

    /**
     * Automatically pauses the audio/video if the document preview is not visible anymore.
     */
    _onResize() {
      if (!this._isVisible) {
        const audio = this.$$('#audio');
        if (audio && !audio.paused) {
          audio.pause();
          return;
        }
        const video = this.$$('#video');
        if (video && !video.isPaused()) {
          video.pause();
        }
      }
    }

    get _isVisible() {
      return Boolean(this.offsetWidth || this.offsetHeight);
    }

    _computePdfSource(blob) {
      return blob.viewUrl ? blob.viewUrl : blob.url;
    }
  }

  customElements.define(DocumentPreview.is, DocumentPreview);
  Nuxeo.DocumentPreview = DocumentPreview;
}
