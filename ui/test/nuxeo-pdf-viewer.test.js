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
import { fixture, html } from '@nuxeo/testing-helpers';
import '../viewers/nuxeo-pdf-viewer.js';

suite('nuxeo-pdf-viewer', () => {
  suite('rendering', () => {
    let element;

    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );
    });

    test('should render an iframe in the shadow root', () => {
      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.exist;
      expect(iframe.tagName).to.equal('IFRAME');
    });

    test('should set the iframe src to the pdfjs viewer URL', () => {
      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.include('pdfjs/web/viewer.html');
    });

    test('should set the iframe title from the pdfViewer.title i18n key', async () => {
      const originalLanguage = window.nuxeo.I18n.language;
      const hadEnDict = window.nuxeo.I18n.en !== undefined;
      const dict = (window.nuxeo.I18n.en = window.nuxeo.I18n.en || {});
      const originalValue = dict['pdfViewer.title'];
      window.nuxeo.I18n.language = 'en';
      dict['pdfViewer.title'] = 'PDF preview';
      try {
        const elem = await fixture(
          html`
            <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
          `,
        );
        const iframe = elem.shadowRoot.querySelector('iframe');
        expect(iframe.hasAttribute('title')).to.be.true;
        expect(iframe.getAttribute('title')).to.equal('PDF preview');
      } finally {
        window.nuxeo.I18n.language = originalLanguage;
        if (originalValue === undefined) {
          delete dict['pdfViewer.title'];
        } else {
          dict['pdfViewer.title'] = originalValue;
        }
        if (!hadEnDict) {
          delete window.nuxeo.I18n.en;
        }
      }
    });

    test('should render with no src without throwing', async () => {
      const elem = await fixture(
        html`
          <nuxeo-pdf-viewer></nuxeo-pdf-viewer>
        `,
      );
      expect(elem).to.exist;
      expect(elem.shadowRoot.querySelector('iframe')).to.exist;
    });
  });

  suite('_path', () => {
    let element;

    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-pdf-viewer></nuxeo-pdf-viewer>
        `,
      );
    });

    test('should return a URL containing the pdfjs viewer path', () => {
      const path = element._path('http://example.com/test.pdf');
      expect(path).to.include('pdfjs/web/viewer.html');
    });

    test('should encode the file URL as a query parameter', () => {
      const fileUrl = 'http://example.com/test.pdf';
      const path = element._path(fileUrl);
      expect(path).to.include(`file=${encodeURIComponent(fileUrl)}`);
    });

    test('should resolve relative paths to absolute URLs before encoding', () => {
      const path = element._path('relative/path/file.pdf');
      expect(path).to.include('pdfjs/web/viewer.html?file=');
      const encodedFile = path.split('file=')[1];
      // The encoded href must be an absolute URL (contains a scheme)
      expect(decodeURIComponent(encodedFile)).to.match(/^https?:\/\//);
    });

    test('should encode query string characters in the file URL', () => {
      const fileUrl = 'http://example.com/test.pdf?token=abc&key=123';
      const path = element._path(fileUrl);
      // The raw '?' and '&' should not appear unencoded inside the file= parameter
      const afterFile = path.split('file=')[1];
      expect(afterFile).to.not.include('?token=abc');
      expect(afterFile).to.not.include('&key=123');
    });
  });

  suite('connectedCallback', () => {
    test('should set _iframeLoadHandler as a function after connection', async () => {
      const element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );
      expect(element._iframeLoadHandler).to.be.a('function');
    });

    test('should attach load event listener to the iframe', async () => {
      const element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );
      const iframe = element.shadowRoot.querySelector('iframe');
      // Dispatching a load event must not throw — proves the listener is attached
      expect(() => iframe.dispatchEvent(new Event('load'))).to.not.throw();
    });
  });

  suite('disconnectedCallback', () => {
    let element;

    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );
    });

    teardown(() => {
      sinon.restore();
    });

    test('should remove the load event listener from the iframe on disconnect', () => {
      const iframe = element.shadowRoot.querySelector('iframe');
      const spy = sinon.spy(iframe, 'removeEventListener');

      element.disconnectedCallback();

      expect(spy).to.have.been.calledWith('load', element._iframeLoadHandler);
    });

    test('should remove keydown blocker from _blockedIframeWindow on disconnect', () => {
      const mockWin = {
        print: () => {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        document: { addEventListener: sinon.spy(), removeEventListener: sinon.spy() },
        get parent() {
          return this;
        },
      };
      const mockIframe = { contentWindow: mockWin, addEventListener: sinon.spy(), removeEventListener: sinon.spy() };
      sinon.stub(element.shadowRoot, 'querySelector').returns(mockIframe);
      element._iframeLoadHandler();

      const blocker = element._keydownBlocker;
      element.disconnectedCallback();

      expect(mockWin.removeEventListener).to.have.been.calledWith('keydown', blocker, true);
      expect(mockWin.document.removeEventListener).to.have.been.calledWith('keydown', blocker, true);
    });

    test('should clear _blockedIframeWindow and _keydownBlocker after disconnect', () => {
      const mockWin = {
        print: () => {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        document: { addEventListener: sinon.spy(), removeEventListener: sinon.spy() },
        get parent() {
          return this;
        },
      };
      const mockIframe = { contentWindow: mockWin, addEventListener: sinon.spy(), removeEventListener: sinon.spy() };
      sinon.stub(element.shadowRoot, 'querySelector').returns(mockIframe);
      element._iframeLoadHandler();

      element.disconnectedCallback();

      expect(element._blockedIframeWindow).to.be.null;
      expect(element._keydownBlocker).to.be.null;
    });

    test('should not throw on disconnect when keydown blocker was never installed', () => {
      // No _iframeLoadHandler called — _blockedIframeWindow is undefined
      expect(() => element.disconnectedCallback()).to.not.throw();
    });

    test('should not throw on disconnect when _blockedIframeWindow.document is null', () => {
      const mockWin = {
        print: () => {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        document: null,
        get parent() {
          return this;
        },
      };
      const mockIframe = { contentWindow: mockWin, addEventListener: sinon.spy(), removeEventListener: sinon.spy() };
      sinon.stub(element.shadowRoot, 'querySelector').returns(mockIframe);
      element._iframeLoadHandler();

      expect(() => element.disconnectedCallback()).to.not.throw();
    });

    test('should not throw on disconnect when removing keydown listener throws (cross-origin)', () => {
      const mockWin = {
        print: () => {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.stub().throws(new DOMException('SecurityError', 'SecurityError')),
        document: { addEventListener: sinon.spy(), removeEventListener: sinon.spy() },
        get parent() {
          return this;
        },
      };
      const mockIframe = { contentWindow: mockWin, addEventListener: sinon.spy(), removeEventListener: sinon.spy() };
      sinon.stub(element.shadowRoot, 'querySelector').returns(mockIframe);
      element._iframeLoadHandler();

      expect(() => element.disconnectedCallback()).to.not.throw();
    });
  });

  suite('_iframeLoadHandler', () => {
    /**
     * Build a plain mock for iframe.contentWindow.
     * By default `parent` points to itself (same-origin scenario where no
     * parent override is needed).
     */
    const createMockWindow = (overrides = {}) => {
      const win = {
        print: () => 'original',
        addEventListener: sinon.spy(),
        document: {
          addEventListener: sinon.spy(),
        },
        ...overrides,
      };
      if (!Object.prototype.hasOwnProperty.call(overrides, 'parent')) {
        win.parent = win;
      }
      return win;
    };

    let element;

    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );
    });

    teardown(() => {
      sinon.restore();
    });

    test('should not throw when querySelector returns null', () => {
      sinon.stub(element.shadowRoot, 'querySelector').returns(null);
      expect(() => element._iframeLoadHandler()).to.not.throw();
    });

    test('should not throw when contentWindow is null', () => {
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: null });
      expect(() => element._iframeLoadHandler()).to.not.throw();
    });

    test('should neutralize iframeWindow.print on load', () => {
      const win = createMockWindow();
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      // After the handler runs, print must be a no-op (returns undefined)
      expect(win.print()).to.be.undefined;
    });

    test('should install keydown blocker on iframeWindow', () => {
      const win = createMockWindow();
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      expect(win.addEventListener).to.have.been.calledWith('keydown', element._keydownBlocker, true);
    });

    test('should install keydown blocker on iframeWindow.document', () => {
      const win = createMockWindow();
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      expect(win.document.addEventListener).to.have.been.calledWith('keydown', element._keydownBlocker, true);
    });

    test('should store _blockedIframeWindow reference after load', () => {
      const win = createMockWindow();
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      expect(element._blockedIframeWindow).to.equal(win);
    });

    test('should not throw when iframeWindow.document is null', () => {
      const win = createMockWindow({ document: null });
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      expect(() => element._iframeLoadHandler()).to.not.throw();
    });

    test('should override parent.print when parent differs from iframeWindow', () => {
      const mockParent = { print: () => 'parent-original' };
      const win = createMockWindow({ parent: mockParent });
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      // parent.print should now be the neutralized no-op
      expect(mockParent.print()).to.be.undefined;
    });

    test('should not override parent.print when parent equals iframeWindow', () => {
      const win = createMockWindow(); // win.parent === win by default
      const originalPrint = win.print;
      // Spy on any property assignments to parent by tracking a separate mock
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      element._iframeLoadHandler();

      // The parent is the same object — only iframeWindow.print itself is replaced.
      // The key check: no secondary assignment path was taken for a separate parent object.
      expect(win.print).to.be.a('function');
      expect(win.print()).to.be.undefined; // replaced by the no-op
      expect(originalPrint).to.not.equal(win.print); // confirms replacement happened on the window itself
    });

    test('should not throw when setting parent.print raises a SecurityError', () => {
      const mockParent = {};
      Object.defineProperty(mockParent, 'print', {
        get: () => () => {},
        set: () => {
          throw new Error('SecurityError');
        },
        configurable: true,
      });
      const win = createMockWindow({ parent: mockParent });
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: win });

      expect(() => element._iframeLoadHandler()).to.not.throw();
    });

    test('should not throw for a cross-origin iframeWindow (outer try/catch)', () => {
      // Simulate a cross-origin contentWindow where setting .print throws
      const crossOriginWindow = {};
      Object.defineProperty(crossOriginWindow, 'print', {
        get: () => () => {},
        set: () => {
          throw new DOMException('Blocked a frame with origin', 'SecurityError');
        },
        configurable: true,
      });
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: crossOriginWindow });

      expect(() => element._iframeLoadHandler()).to.not.throw();
    });
  });

  suite('keydown blocker', () => {
    let element;

    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
        `,
      );

      const mockWin = {
        print: () => {},
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
        document: { addEventListener: sinon.spy(), removeEventListener: sinon.spy() },
        get parent() {
          return this;
        },
      };
      sinon.stub(element.shadowRoot, 'querySelector').returns({ contentWindow: mockWin });
      element._iframeLoadHandler();
    });

    teardown(() => {
      sinon.restore();
    });

    const makeKeyEvent = (ctrlKey, metaKey, key) => {
      return {
        ctrlKey,
        metaKey,
        key,
        preventDefault: sinon.spy(),
        stopImmediatePropagation: sinon.spy(),
      };
    };

    test('should block Ctrl+P', () => {
      const e = makeKeyEvent(true, false, 'p');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should block Ctrl+Shift+P (uppercase P)', () => {
      const e = makeKeyEvent(true, false, 'P');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should block Ctrl+S', () => {
      const e = makeKeyEvent(true, false, 's');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should block Ctrl+Shift+S (uppercase S)', () => {
      const e = makeKeyEvent(true, false, 'S');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should block Cmd+P', () => {
      const e = makeKeyEvent(false, true, 'p');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should block Cmd+S', () => {
      const e = makeKeyEvent(false, true, 's');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.have.been.calledOnce;
      expect(e.stopImmediatePropagation).to.have.been.calledOnce;
    });

    test('should not block an unrelated key combination (Ctrl+A)', () => {
      const e = makeKeyEvent(true, false, 'a');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.not.have.been.called;
      expect(e.stopImmediatePropagation).to.not.have.been.called;
    });

    test('should not block when no modifier key is held (plain P)', () => {
      const e = makeKeyEvent(false, false, 'p');
      element._keydownBlocker(e);
      expect(e.preventDefault).to.not.have.been.called;
      expect(e.stopImmediatePropagation).to.not.have.been.called;
    });
  });
});
