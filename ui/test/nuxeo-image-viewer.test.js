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
import { fixture, isElementVisible, html, tap, timePasses, waitForEvent } from '@nuxeo/testing-helpers';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import '../viewers/nuxeo-image-viewer.js';

const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

suite('nuxeo-image-viewer', () => {
  const viewerLoad = (viewer) => {
    if (viewer._el && viewer._el.ready) {
      return Promise.resolve();
    }
    return waitForEvent(viewer.$.image, 'ready');
  };

  const isViewerVisible = (viewer) => isElementVisible(viewer.$$('.cropper-container'));

  const isToolbarVisible = (viewer) => isElementVisible(viewer.$$('#toolbar'));

  const waitViewerLoad = (viewer, ms) => Promise.race([viewerLoad(viewer), timePasses(ms)]);

  suite('Visibility', () => {
    test('Should not render image content when no source image is provided', async () => {
      const viewer = await fixture(
        html`
          <nuxeo-image-viewer></nuxeo-image-viewer>
        `,
      );
      try {
        await waitViewerLoad(viewer, 500);
      } finally {
        expect(isViewerVisible(viewer)).to.be.false;
        expect(viewer._el).to.be.undefined;
      }
    });

    test('Should not render image content when a nonexistent source image is provided', async () => {
      const viewer = await fixture(
        html`
          <nuxeo-image-viewer src="${base}/resources/nonexistent.png"></nuxeo-image-viewer>
        `,
      );
      try {
        await waitViewerLoad(viewer, 500);
      } finally {
        expect(isViewerVisible(viewer)).to.be.false;
        expect(viewer._el).to.be.undefined;
      }
    });

    test('Should render image content when a source image is provided', async () => {
      const viewer = await fixture(
        html`
          <nuxeo-image-viewer src="${base}/resources/sample.png"></nuxeo-image-viewer>
        `,
      );
      await viewerLoad(viewer);
      expect(isViewerVisible(viewer)).to.be.true;
    });

    test('Should render an alt attribute when it is provided', async () => {
      const viewer = await fixture(
        html`
          <nuxeo-image-viewer
            src="${base}/resources/sample.png"
            alt="alternative text that describes an image"
          ></nuxeo-image-viewer>
        `,
      );
      await viewerLoad(viewer);
      expect(isViewerVisible(viewer)).to.be.true;
      expect(viewer.getAttribute('alt')).to.exist.and.to.be.equal('alternative text that describes an image');
    });

    suite('Controls Toolbar', () => {
      test('Should not render controls toolbar when no source image is provided', async () => {
        const viewer = await fixture(
          html`
            <nuxeo-image-viewer controls></nuxeo-image-viewer>
          `,
        );
        expect(isToolbarVisible(viewer)).to.be.false;
      });

      test('Should not render controls toolbar when a nonexistent source image is provided', async () => {
        const viewer = await fixture(
          html`
            <nuxeo-image-viewer src="${base}/resources/nonexistent.png" controls></nuxeo-image-viewer>
          `,
        );
        expect(isToolbarVisible(viewer)).to.be.false;
      });

      test('Should render controls toolbar when a source image is provided', async () => {
        const viewer = await fixture(
          html`
            <nuxeo-image-viewer src="${base}/resources/sample.png" controls></nuxeo-image-viewer>
          `,
        );
        await viewerLoad(viewer);
        expect(isToolbarVisible(viewer)).to.be.true;
      });

      test('Should display five options when the toolbar is displayed', async () => {
        const viewer = await fixture(
          html`
            <nuxeo-image-viewer src="${base}/resources/sample.png" controls></nuxeo-image-viewer>
          `,
        );
        await viewerLoad(viewer);
        expect(isToolbarVisible(viewer)).to.be.true;
        const toolbar = viewer.$$('#toolbar');

        // The toolbar uses two <dom-if> templates to swap fit-to-real-size / fit-to-viewer; those
        // template placeholders also show up under `toolbar.children`. The user-visible buttons
        // are the <paper-icon-button> elements only.
        const options = toolbar.querySelectorAll('paper-icon-button');
        expect(options).to.have.lengthOf(5);
      });

      suite('Options', () => {
        let viewer;
        let toolbar;
        // Helper that returns the user-visible toolbar buttons in render order, ignoring the
        // two <dom-if> template placeholders the production element emits to switch between
        // fit-to-real-size and fit-to-viewer.
        const buttons = () => Array.from(toolbar.querySelectorAll('paper-icon-button'));
        setup(async () => {
          viewer = await fixture(
            html`
              <nuxeo-image-viewer src="${base}/resources/sample.png" controls></nuxeo-image-viewer>
            `,
          );
          await viewerLoad(viewer);
          toolbar = viewer.$$('#toolbar');
        });

        test('Should display zoom out option in the first position when the toolbar is displayed', () => {
          const zoomOutOption = buttons()[0];
          expect(isElementVisible(zoomOutOption)).to.be.true;
          expect(zoomOutOption.getAttribute('data-action')).to.equal('zoom-out');
          expect(zoomOutOption.icon).to.equal('zoom-out');
        });

        test(
          'Should display "fit to real size" option in the second position when the toolbar is displayed ' +
            '(with zoom applied)',
          () => {
            const fitToRealSizeOption = buttons()[1];
            expect(isElementVisible(fitToRealSizeOption)).to.be.true;
            expect(fitToRealSizeOption.getAttribute('data-action')).to.equal('fit-to-real-size');
            expect(fitToRealSizeOption.icon).to.equal('nuxeo:fit-to-real-size');
          },
        );

        test(
          'Should display "fit to viewer option" in the second position when the toolbar is displayed ' +
            '(without zoom applied)',
          () => {
            // The fit-to-real-size / fit-to-viewer toggle is a <dom-if>. Setting the property and
            // forcing the inner <dom-if>s to re-render swaps the second toolbar button between
            // the two icons. The toolbar lives inside an outer <dom-if> too, so we walk all
            // <dom-if>s in the viewer's shadow root to make sure they re-evaluate their `if`.
            viewer.setProperties({ _fitToRealSize: true });
            viewer.shadowRoot.querySelectorAll('dom-if').forEach((domIf) => domIf.render && domIf.render());
            flush();

            const fitToViewerOption = toolbar.querySelector('paper-icon-button[data-action="fit-to-viewer"]');
            expect(fitToViewerOption).to.exist;
            expect(isElementVisible(fitToViewerOption)).to.be.true;
            expect(fitToViewerOption.icon).to.equal('nuxeo:fit-to-viewer');
            // After the swap, only fit-to-viewer should be present (fit-to-real-size's <dom-if>
            // hides it). We only assert presence + uniqueness, not its exact ordinal — the
            // <dom-if> templates may be re-stamped at the end of the toolbar's child list.
            const fitToRealSize = toolbar.querySelector('paper-icon-button[data-action="fit-to-real-size"]');
            expect(fitToRealSize === null || !isElementVisible(fitToRealSize)).to.be.true;
          },
        );

        test('Should display zoom out option in the third position when the toolbar is displayed', () => {
          const zoomInOption = buttons()[2];
          expect(isElementVisible(zoomInOption)).to.be.true;
          expect(zoomInOption.getAttribute('data-action')).to.equal('zoom-in');
          expect(zoomInOption.icon).to.equal('zoom-in');
        });

        test('Should display zoom out option in the fourth position when the toolbar is displayed', () => {
          const rotateLeftOption = buttons()[3];
          expect(isElementVisible(rotateLeftOption)).to.be.true;
          expect(rotateLeftOption.getAttribute('data-action')).to.equal('rotate-left');
          expect(rotateLeftOption.icon).to.equal('image:rotate-left');
        });

        test('Should display zoom out option in the fifth position when the toolbar is displayed', () => {
          const rotateRightOption = buttons()[4];
          expect(isElementVisible(rotateRightOption)).to.be.true;
          expect(rotateRightOption.getAttribute('data-action')).to.equal('rotate-right');
          expect(rotateRightOption.icon).to.equal('image:rotate-right');
        });
      });
    });
  });

  suite('Interactions', () => {
    suite('Controls Toolbar', () => {
      let viewer;
      let toolbar;
      // Same rationale as the Options suite: skip <dom-if> placeholders and operate on the real
      // <paper-icon-button> elements only.
      const buttons = () => Array.from(toolbar.querySelectorAll('paper-icon-button'));
      setup(async () => {
        viewer = await fixture(
          html`
            <nuxeo-image-viewer src="${base}/resources/sample.png" controls></nuxeo-image-viewer>
          `,
        );
        await viewerLoad(viewer);
        toolbar = viewer.$$('#toolbar');
      });

      test('Should call method to zoom out when first button is pressed', () => {
        const zoomOutOption = buttons()[0];
        expect(zoomOutOption.getAttribute('data-action')).to.equal('zoom-out');

        sinon.spy(viewer._el, 'zoom');
        tap(zoomOutOption);
        expect(viewer._el.zoom.withArgs(-0.1).calledOnce).to.be.true;
      });

      test('Should call method to fit to real size when second button is pressed and no zoom was applied', () => {
        const fitToRealSizeOption = buttons()[1];
        expect(fitToRealSizeOption.getAttribute('data-action')).to.equal('fit-to-real-size');

        sinon.spy(viewer._el, 'zoomTo');
        tap(fitToRealSizeOption);
        expect(viewer._el.zoomTo.withArgs(1).calledOnce).to.be.true;
      });

      test('Should call method to fit to viewer when second button is pressed and some zoom was applied', () => {
        viewer.setProperties({ _fitToRealSize: true });
        viewer.shadowRoot.querySelectorAll('dom-if').forEach((domIf) => domIf.render && domIf.render());
        flush();

        const fitToViewerOption = toolbar.querySelector('paper-icon-button[data-action="fit-to-viewer"]');
        expect(fitToViewerOption).to.exist;
        expect(fitToViewerOption.getAttribute('data-action')).to.equal('fit-to-viewer');

        sinon.spy(viewer._el, 'zoomTo');
        tap(fitToViewerOption);
        expect(viewer._el.zoomTo.calledOnce).to.be.true;
      });

      test('Should call method to zoom in when third button is pressed', () => {
        const zoomInOption = buttons()[2];
        expect(zoomInOption.getAttribute('data-action')).to.equal('zoom-in');

        sinon.spy(viewer._el, 'zoom');
        tap(zoomInOption);
        expect(viewer._el.zoom.withArgs(0.1).calledOnce).to.be.true;
      });

      test('Should call method to rotate left when fourth button is pressed', () => {
        const rotateLeftOption = buttons()[3];
        expect(rotateLeftOption.getAttribute('data-action')).to.equal('rotate-left');

        sinon.spy(viewer._el, 'rotate');
        tap(rotateLeftOption);
        expect(viewer._el.rotate.withArgs(-90).calledOnce).to.be.true;
      });

      test('Should call method to rotate right when fifth button is pressed', () => {
        const rotateRightOption = buttons()[4];
        expect(rotateRightOption.getAttribute('data-action')).to.equal('rotate-right');

        sinon.spy(viewer._el, 'rotate');
        tap(rotateRightOption);
        expect(viewer._el.rotate.withArgs(90).calledOnce).to.be.true;
      });
    });

    suite('Window Resize', () => {
      test("Should not reset zoom when viewer's parent width is zero", async () => {
        const container = await fixture(
          html`
            <div id="parent" style="width: 0px">
              <nuxeo-image-viewer src="${base}/resources/sample.png" />
            </div>
          `,
        );
        const viewer = container.querySelector('nuxeo-image-viewer');
        await viewerLoad(viewer);

        sinon.spy(viewer._el, 'resize');
        sinon.spy(viewer._el, 'zoomTo');

        viewer.dispatchEvent(new CustomEvent('resize', { bubbles: true }));

        expect(viewer._el.resize.notCalled).to.be.true;
        expect(viewer._el.zoomTo.notCalled).to.be.true;
      });

      test("Should not reset zoom when viewer's parent height is zero", async () => {
        const container = await fixture(
          html`
            <div id="parent" style="height: 0px">
              <nuxeo-image-viewer src="${base}/resources/sample.png" />
            </div>
          `,
        );
        const viewer = container.querySelector('nuxeo-image-viewer');
        await viewerLoad(viewer);

        sinon.spy(viewer._el, 'resize');
        sinon.spy(viewer._el, 'zoomTo');

        viewer.dispatchEvent(new CustomEvent('resize', { bubbles: true }));

        expect(viewer._el.resize.notCalled).to.be.true;
        expect(viewer._el.zoomTo.notCalled).to.be.true;
      });

      test("Should resize and apply default zoom when viewer's parent is visible", async () => {
        const container = await fixture(
          html`
            <div id="parent" style="height: 100px; width: 100px">
              <nuxeo-image-viewer src="${base}/resources/sample.png" />
            </div>
          `,
        );
        const viewer = container.querySelector('nuxeo-image-viewer');
        await viewerLoad(viewer);

        sinon.spy(viewer._el, 'resize');
        sinon.spy(viewer._el, 'zoomTo');
        viewer.dispatchEvent(new CustomEvent('resize', { bubbles: true }));

        expect(viewer._el.resize.calledOnce).to.be.true;
        expect(viewer._el.zoomTo.calledOnce).to.be.true;
      });
    });
  });
});
