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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  // `LinkTarget.BLANK` from pdf.js. The viewer exposes the enum as
  // `PDFViewerApplicationConstants`; this literal is only the fallback for a build that
  // stops publishing it, so external links keep opening in a new tab either way.
  const LINK_TARGET_BLANK = 2;

  // Opening a link in a new browsing context must never leak the opener to the target
  // page, so pin the relationship rather than relying on the pdf.js default.
  const EXTERNAL_LINK_REL = 'noopener noreferrer nofollow';

  // Marks the links we have already labelled, so re-rendering a page (zoom, scroll)
  // cannot append the warning twice.
  const LABELLED_ATTRIBUTE = 'data-nuxeo-external-link';

  const EXTERNAL_LINK_SELECTOR = `.annotationLayer a[target="_blank"]:not([${LABELLED_ATTRIBUTE}])`;

  /**
   * An element for viewing PDF files.
   *
   * Example:
   *
   *     <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
   *
   * ### Styling
   *
   * The following custom properties and mixins are available for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-pdf-viewer-layout` | Mixin applied to the viewer | `{}`
   * `--nuxeo-pdf-viewer-iframe` | Mixin applied to the iframe enclosing pdfjs | `{}`
   *
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-pdf-viewer/index.html
   */
  class PDFViewer extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            @apply --nuxeo-pdf-viewer-layout;
          }

          iframe {
            width: 100%;
            height: 100%;
            min-height: var(--nuxeo-viewer-min-height, 60vh);
            border: 0;
            @apply --nuxeo-pdf-viewer-iframe;
          }
        </style>

        <iframe src$="[[_path(src)]]" title$="[[i18n('pdfViewer.title')]]"></iframe>
      `;
    }

    static get is() {
      return 'nuxeo-pdf-viewer';
    }

    static get properties() {
      return {
        /**
         * The path to the pdf file to display.
         */
        src: {
          type: String,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    connectedCallback() {
      super.connectedCallback();
      // pdf.js dispatches `webviewerloaded` on the embedder's document immediately
      // before it builds the viewer, which is the supported point to override its
      // options — waiting for the iframe's own load event would be too late.
      this._webViewerLoadedHandler = (e) => {
        const viewerWindow = e && e.detail && e.detail.source;
        if (!this._isCurrentViewerWindow(viewerWindow)) {
          return;
        }
        this._configureExternalLinks(viewerWindow);
      };
      document.addEventListener('webviewerloaded', this._webViewerLoadedHandler);
      this._iframeLoadHandler = () => {
        try {
          const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
          const iframeWindow = iframe && iframe.contentWindow;
          if (!iframeWindow) {
            return;
          }
          // Neutralize window.print so Ctrl/Cmd+P cannot trigger the print dialog,
          // even when PDF.js's own keydown handler (registered earlier inside the
          // iframe during DOMContentLoaded) runs first and calls window.print().
          iframeWindow.print = () => {};
          if (iframeWindow.parent && iframeWindow.parent !== iframeWindow) {
            try {
              iframeWindow.parent.print = () => {};
            } catch (err) {
              // Intentionally swallowed: setting parent.print throws a SecurityError
              // when the parent frame is cross-origin. There is nothing to act on.
              void err;
            }
          }
          // Block Ctrl/Cmd+S (save) and act as a backup for Ctrl/Cmd+P.
          this._keydownBlocker = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          };
          this._blockedIframeWindow = iframeWindow;
          iframeWindow.addEventListener('keydown', this._keydownBlocker, true);
          if (iframeWindow.document) {
            iframeWindow.document.addEventListener('keydown', this._keydownBlocker, true);
          }
        } catch (e) {
          // Intentionally swallowed: accessing contentWindow properties throws a
          // SecurityError for cross-origin iframes. There is nothing to act on.
          void e;
        }
      };
      // Shadow DOM is ready synchronously after connectedCallback in custom elements v1
      const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
      if (iframe) {
        iframe.addEventListener('load', this._iframeLoadHandler);
      }
    }

    /**
     * Make links that point outside the document open in a new tab.
     *
     * pdf.js defaults `externalLinkTarget` to `LinkTarget.NONE` and then, on detecting
     * that it is embedded in a frame, promotes it to `LinkTarget.TOP`. Because this
     * viewer always runs inside an iframe, every external link would otherwise be
     * rendered with `target="_top"` and replace the whole Web UI tab, throwing the user
     * out of the document they were reading. Only links carrying a URL action go
     * through this code path in pdf.js, so intra-document links keep scrolling the
     * viewer instead of navigating.
     */
    /**
     * Whether the given window is the one the iframe is showing right now. The element is
     * reused across documents, so a viewer from a previous `src` can still be running.
     */
    _isCurrentViewerWindow(viewerWindow) {
      const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
      return Boolean(viewerWindow) && Boolean(iframe) && viewerWindow === iframe.contentWindow;
    }

    _configureExternalLinks(viewerWindow) {
      const options = viewerWindow.PDFViewerApplicationOptions;
      if (!options) {
        return;
      }
      const constants = viewerWindow.PDFViewerApplicationConstants;
      const blank = (constants && constants.LinkTarget && constants.LinkTarget.BLANK) || LINK_TARGET_BLANK;
      options.set('externalLinkTarget', blank);
      options.set('externalLinkRel', EXTERNAL_LINK_REL);
      this._announceExternalLinks(viewerWindow);
    }

    /**
     * Opening a new tab is a change of context, which WCAG 3.2.5 asks us to announce in
     * advance, so label the links as they are rendered.
     */
    _announceExternalLinks(viewerWindow) {
      const app = viewerWindow.PDFViewerApplication;
      if (!app || !app.initializedPromise) {
        return;
      }
      app.initializedPromise.then(
        () => {
          // The element can be detached, or the iframe moved on to another document,
          // while this viewer was still initialising. Subscribing then would either leak
          // a listener disconnectedCallback() has already run past, or let a stale viewer
          // take over the subscription that belongs to the one now on screen.
          if (!this.isConnected || !this._isCurrentViewerWindow(viewerWindow) || !app.eventBus) {
            return;
          }
          this._unsubscribeFromAnnotationLayer();
          this._pdfEventBus = app.eventBus;
          // Scope the lookup to the page that just rendered rather than rescanning the
          // whole document on every layer render.
          this._annotationLayerHandler = (e) =>
            this._labelExternalLinks((e && e.source && e.source.div) || viewerWindow.document);
          this._pdfEventBus.on('annotationlayerrendered', this._annotationLayerHandler);
        },
        (err) => {
          // Intentionally swallowed: the viewer failed to initialise, which it already
          // reports to the user. There is no link to label in that case.
          void err;
        },
      );
    }

    _unsubscribeFromAnnotationLayer() {
      if (this._pdfEventBus && this._annotationLayerHandler) {
        this._pdfEventBus.off('annotationlayerrendered', this._annotationLayerHandler);
      }
      this._pdfEventBus = null;
      this._annotationLayerHandler = null;
    }

    _labelExternalLinks(root) {
      root.querySelectorAll(EXTERNAL_LINK_SELECTOR).forEach((link) => {
        link.setAttribute(LABELLED_ATTRIBUTE, '');
        // pdf.js renders link annotations as empty anchors overlaying the page, so
        // `title` is both the tooltip and the accessible name. Warning there reaches
        // pointer and assistive-technology users alike.
        link.title = this.i18n('pdfViewer.externalLinkNewTab', link.href);
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
      if (iframe && this._iframeLoadHandler) {
        iframe.removeEventListener('load', this._iframeLoadHandler);
      }
      if (this._webViewerLoadedHandler) {
        document.removeEventListener('webviewerloaded', this._webViewerLoadedHandler);
        this._webViewerLoadedHandler = null;
      }
      this._unsubscribeFromAnnotationLayer();
      if (this._blockedIframeWindow && this._keydownBlocker) {
        try {
          this._blockedIframeWindow.removeEventListener('keydown', this._keydownBlocker, true);
          if (this._blockedIframeWindow.document) {
            this._blockedIframeWindow.document.removeEventListener('keydown', this._keydownBlocker, true);
          }
        } catch (e) {
          // Intentionally swallowed: removeEventListener throws a SecurityError
          // for cross-origin iframes. There is nothing to act on.
          void e;
        }
        this._blockedIframeWindow = null;
        this._keydownBlocker = null;
      }
    }

    _path(file) {
      // get an absolute href
      const el = document.createElement('a');
      el.href = file;
      return this.resolveUrl(`pdfjs/web/viewer.html?file=${encodeURIComponent(el.href)}`);
    }
  }

  customElements.define(PDFViewer.is, PDFViewer);
  Nuxeo.PDFViewer = PDFViewer;
}
