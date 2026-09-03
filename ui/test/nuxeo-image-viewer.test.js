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
import { fixture, html, isElementVisible, tap, timePasses, waitForEvent } from '@nuxeo/testing-helpers';
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

    // ELEMENTS-1616: the viewer needs crossorigin so its canvas (Cropper.js /
    // toolbar contrast sampling) is not tainted for cross-origin (S3) images and
    // so the response is cached with CORS headers.
    test('Should render the image with crossorigin="anonymous"', async () => {
      const viewer = await fixture(
        html`
          <nuxeo-image-viewer></nuxeo-image-viewer>
        `,
      );
      expect(viewer.$.image.getAttribute('crossorigin')).to.equal('anonymous');
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

      test('Should display nine options when the toolbar is displayed', async () => {
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
        // are the <paper-icon-button> elements only: zoom out, fit, zoom in, rotate left/right and
        // the four panning controls.
        const options = toolbar.querySelectorAll('paper-icon-button');
        expect(options).to.have.lengthOf(9);
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

        /**
         * WEBUI-2145: dragging used to be the only pointer gesture that could move a zoomed image,
         * which fails WCAG 2.1 SC 2.5.7 (Dragging Movements). The toolbar now ends with four
         * single-activation panning controls, laid out as a flattened d-pad (left, up, down, right).
         */
        suite('Panning controls', () => {
          const panButtons = [
            { action: 'pan-left', icon: 'arrow-back', id: 'panLeft' },
            { action: 'pan-up', icon: 'arrow-upward', id: 'panUp' },
            { action: 'pan-down', icon: 'arrow-downward', id: 'panDown' },
            { action: 'pan-right', icon: 'arrow-forward', id: 'panRight' },
          ];

          panButtons.forEach(({ action, icon, id }, index) => {
            test(`Should display the ${action} option after the rotation options`, () => {
              const option = buttons()[5 + index];
              expect(isElementVisible(option)).to.be.true;
              expect(option.getAttribute('data-action')).to.equal(action);
              expect(option.icon).to.equal(icon);
              expect(option.id).to.equal(id);
            });
          });

          test('Should give every panning control an accessible name and a tooltip on focus', () => {
            panButtons.forEach(({ action, id }) => {
              const option = toolbar.querySelector(`paper-icon-button[data-action="${action}"]`);
              expect(option.getAttribute('aria-label'), `missing aria-label on ${action}`).to.be.a('string').and.not.to
                .be.empty;
              const tooltip = toolbar.querySelector(`nuxeo-tooltip[for="${id}"]`);
              expect(tooltip, `no nuxeo-tooltip for #${id}`).to.exist;
              // Targeting the button itself is what makes the tooltip open on focus, since `focus`
              // does not bubble.
              expect(tooltip.target).to.equal(option);
            });
          });

          test('Should keep the panning controls reachable with the keyboard', () => {
            panButtons.forEach(({ action }) => {
              const option = toolbar.querySelector(`paper-icon-button[data-action="${action}"]`);
              expect(option.getAttribute('tabindex')).to.equal('0');
              expect(option.disabled).to.be.false;
            });
          });
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

      /**
       * WEBUI-2145: a single activation of a panning control has to move the image, so that panning
       * no longer requires a dragging movement.
       */
      suite('Panning controls', () => {
        // The canvas moves opposite to the direction the viewport travels, so panning left moves the
        // canvas right — see PAN_DIRECTIONS in nuxeo-image-viewer.js.
        const expectations = [
          { action: 'pan-left', axis: 'x', sign: 1 },
          { action: 'pan-right', axis: 'x', sign: -1 },
          { action: 'pan-up', axis: 'y', sign: 1 },
          { action: 'pan-down', axis: 'y', sign: -1 },
        ];

        expectations.forEach(({ action, axis, sign }) => {
          test(`Should move the image when the ${action} button is pressed`, () => {
            const option = toolbar.querySelector(`paper-icon-button[data-action="${action}"]`);
            expect(option).to.exist;

            sinon.spy(viewer._el, 'move');
            tap(option);

            expect(viewer._el.move.calledOnce).to.be.true;
            const [offsetX, offsetY] = viewer._el.move.firstCall.args;
            const along = axis === 'x' ? offsetX : offsetY;
            const across = axis === 'x' ? offsetY : offsetX;
            expect(Math.sign(along)).to.equal(sign);
            expect(Math.abs(along)).to.be.at.least(24);
            expect(across).to.equal(0);
          });
        });

        test('Should pan without any dragging movement', () => {
          // `tap` dispatches a down/up pair on the same coordinates: no pointer movement while a
          // button is held, which is what WCAG 2.1 SC 2.5.7 asks for.
          const option = toolbar.querySelector('paper-icon-button[data-action="pan-right"]');
          const before = viewer._el.getCanvasData();
          tap(option);
          const after = viewer._el.getCanvasData();
          expect(after.left).to.be.lessThan(before.left);
        });
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

suite('nuxeo-image-viewer extras', () => {
  let el;
  let sandbox;

  setup(async () => {
    sandbox = sinon.createSandbox();
    el = await fixture(
      html`
        <nuxeo-image-viewer></nuxeo-image-viewer>
      `,
    );
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('_isToolbarVisible', () => {
    test('returns truthy when all three arguments are truthy', () => {
      expect(el._isToolbarVisible(true, 'http://img.png', {})).to.be.ok;
    });

    test('returns falsy when controls is false', () => {
      expect(el._isToolbarVisible(false, 'http://img.png', {})).to.not.be.ok;
    });

    test('returns falsy when src is empty', () => {
      expect(el._isToolbarVisible(true, '', {})).to.not.be.ok;
    });

    test('returns falsy when src is null', () => {
      expect(el._isToolbarVisible(true, null, {})).to.not.be.ok;
    });

    test('returns falsy when el is null', () => {
      expect(el._isToolbarVisible(true, 'http://img.png', null)).to.not.be.ok;
    });

    test('returns falsy when el is undefined', () => {
      expect(el._isToolbarVisible(true, 'http://img.png', undefined)).to.not.be.ok;
    });

    test('returns falsy when all arguments are falsy', () => {
      expect(el._isToolbarVisible(false, '', null)).to.not.be.ok;
    });
  });

  suite('_isCanvasVisible', () => {
    test('returns true when canvas has non-zero dimensions', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(100);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(200);
      expect(el._isCanvasVisible()).to.be.true;
    });

    test('returns false when canvas offsetWidth is 0', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(0);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(200);
      expect(el._isCanvasVisible()).to.be.false;
    });

    test('returns false when canvas offsetHeight is 0', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(100);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(0);
      expect(el._isCanvasVisible()).to.be.false;
    });

    test('returns false when both dimensions are 0', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(0);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(0);
      expect(el._isCanvasVisible()).to.be.false;
    });
  });

  suite('_getOriginalZoomRatio', () => {
    test('returns undefined when _el is not set', () => {
      el._el = null;
      expect(el._getOriginalZoomRatio()).to.be.undefined;
    });

    test('returns ratio of canvas width to natural width', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      expect(el._getOriginalZoomRatio()).to.equal(0.5);
    });

    test('returns 1 when width equals naturalWidth', () => {
      el._el = { initialCanvasData: { width: 800, naturalWidth: 800 } };
      expect(el._getOriginalZoomRatio()).to.equal(1);
    });
  });

  suite('_verifyZoomRatio', () => {
    test('does nothing when _el is falsy', () => {
      el._el = null;
      el._fitToRealSize = false;
      el._verifyZoomRatio({ detail: { ratio: 0.5 } });
      expect(el._fitToRealSize).to.be.false;
    });

    test('does nothing when data is null', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      el._fitToRealSize = false;
      el._verifyZoomRatio(null);
      expect(el._fitToRealSize).to.be.false;
    });

    test('does nothing when data.detail is missing', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      el._fitToRealSize = false;
      el._verifyZoomRatio({});
      expect(el._fitToRealSize).to.be.false;
    });

    test('does nothing when data.detail.ratio is missing', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      el._fitToRealSize = false;
      el._verifyZoomRatio({ detail: {} });
      expect(el._fitToRealSize).to.be.false;
    });

    test('sets _fitToRealSize to true when ratio differs from original', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      el._fitToRealSize = false;
      el._verifyZoomRatio({ detail: { ratio: 0.8 } });
      expect(el._fitToRealSize).to.be.true;
    });

    test('sets _fitToRealSize to false when ratio matches original', () => {
      el._el = { initialCanvasData: { width: 500, naturalWidth: 1000 } };
      el._fitToRealSize = true;
      el._verifyZoomRatio({ detail: { ratio: 0.5 } });
      expect(el._fitToRealSize).to.be.false;
    });
  });

  suite('_getThemeByName', () => {
    test('returns light theme object when name is "light"', () => {
      const theme = el._getThemeByName('light');
      expect(theme.iconColor).to.equal('#111111');
      expect(theme.surfaceRgb).to.deep.equal({ r: 255, g: 255, b: 255 });
      expect(theme.surfaceLuminance).to.equal(1);
      expect(theme.surfaceAlpha).to.equal(0.82);
    });

    test('returns dark theme object when name is "dark"', () => {
      const theme = el._getThemeByName('dark');
      expect(theme.iconColor).to.equal('#ffffff');
      expect(theme.iconLuminance).to.equal(1);
      expect(theme.surfaceRgb).to.deep.equal({ r: 0, g: 0, b: 0 });
      expect(theme.surfaceLuminance).to.equal(0);
      expect(theme.surfaceAlpha).to.equal(0.82);
    });

    test('returns dark theme by default for unknown name', () => {
      const theme = el._getThemeByName('unknown');
      expect(theme.iconColor).to.equal('#ffffff');
      expect(theme.surfaceLuminance).to.equal(0);
    });

    test('returns dark theme when name is null', () => {
      const theme = el._getThemeByName(null);
      expect(theme.iconColor).to.equal('#ffffff');
    });

    test('light theme has correct iconLuminance', () => {
      const theme = el._getThemeByName('light');
      const expected = el._relativeLuminanceFromRgb(17, 17, 17);
      expect(theme.iconLuminance).to.be.closeTo(expected, 0.0001);
    });
  });

  suite('_mixLuminance', () => {
    test('returns foreground when alpha is 1', () => {
      expect(el._mixLuminance(0.5, 0.8, 1)).to.equal(0.5);
    });

    test('returns background when alpha is 0', () => {
      expect(el._mixLuminance(0.5, 0.8, 0)).to.equal(0.8);
    });

    test('returns weighted average for intermediate alpha', () => {
      const result = el._mixLuminance(0.2, 0.8, 0.5);
      expect(result).to.be.closeTo(0.5, 0.0001);
    });

    test('handles zero values', () => {
      expect(el._mixLuminance(0, 0, 0.5)).to.equal(0);
    });

    test('correctly mixes dark surface over light background', () => {
      const result = el._mixLuminance(0, 1, 0.82);
      expect(result).to.be.closeTo(0.18, 0.0001);
    });
  });

  suite('_contrastRatio', () => {
    test('returns 21:1 for black and white', () => {
      const ratio = el._contrastRatio(1, 0);
      expect(ratio).to.equal(21);
    });

    test('returns 1:1 for identical luminances', () => {
      const ratio = el._contrastRatio(0.5, 0.5);
      expect(ratio).to.equal(1);
    });

    test('is commutative (order does not matter)', () => {
      expect(el._contrastRatio(0.3, 0.7)).to.equal(el._contrastRatio(0.7, 0.3));
    });

    test('handles very low luminance values', () => {
      const ratio = el._contrastRatio(0.01, 0);
      expect(ratio).to.be.closeTo(1.2, 0.1);
    });
  });

  suite('_relativeLuminanceFromRgb', () => {
    test('returns 0 for black (0, 0, 0)', () => {
      expect(el._relativeLuminanceFromRgb(0, 0, 0)).to.equal(0);
    });

    test('returns 1 for white (255, 255, 255)', () => {
      expect(el._relativeLuminanceFromRgb(255, 255, 255)).to.be.closeTo(1, 0.0001);
    });

    test('green channel dominates luminance', () => {
      const redLum = el._relativeLuminanceFromRgb(255, 0, 0);
      const greenLum = el._relativeLuminanceFromRgb(0, 255, 0);
      const blueLum = el._relativeLuminanceFromRgb(0, 0, 255);
      expect(greenLum).to.be.greaterThan(redLum);
      expect(greenLum).to.be.greaterThan(blueLum);
    });

    test('mid-gray is approximately 0.2', () => {
      const lum = el._relativeLuminanceFromRgb(128, 128, 128);
      expect(lum).to.be.closeTo(0.2158, 0.01);
    });
  });

  suite('_linearizeSrgb', () => {
    test('uses linear formula for values below threshold', () => {
      const value = 0.03;
      expect(el._linearizeSrgb(value)).to.be.closeTo(value / 12.92, 0.0001);
    });

    test('uses power formula for values above threshold', () => {
      const value = 0.5;
      const expected = ((value + 0.055) / 1.055) ** 2.4;
      expect(el._linearizeSrgb(value)).to.be.closeTo(expected, 0.0001);
    });

    test('returns 0 for input 0', () => {
      expect(el._linearizeSrgb(0)).to.equal(0);
    });

    test('returns 1 for input 1', () => {
      expect(el._linearizeSrgb(1)).to.be.closeTo(1, 0.0001);
    });

    test('value at threshold boundary (0.03928) uses linear formula', () => {
      expect(el._linearizeSrgb(0.03928)).to.be.closeTo(0.03928 / 12.92, 0.0001);
    });

    test('value just above threshold uses power formula', () => {
      const value = 0.04;
      const expected = ((value + 0.055) / 1.055) ** 2.4;
      expect(el._linearizeSrgb(value)).to.be.closeTo(expected, 0.0001);
    });
  });

  suite('_click', () => {
    let mockEl;

    setup(() => {
      mockEl = {
        zoom: sinon.spy(),
        zoomTo: sinon.spy(),
        rotate: sinon.spy(),
        move: sinon.spy(),
        initialCanvasData: { width: 500, naturalWidth: 1000 },
      };
      el._el = mockEl;
      sandbox.stub(el, '_scheduleToolbarContrastUpdate');
    });

    test('zoom-in calls _el.zoom(0.1)', () => {
      el._click({ target: { dataset: { action: 'zoom-in' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoom).to.have.been.calledWith(0.1);
    });

    test('zoom-out calls _el.zoom(-0.1)', () => {
      el._click({ target: { dataset: { action: 'zoom-out' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoom).to.have.been.calledWith(-0.1);
    });

    test('fit-to-viewer calls _el.zoomTo with original ratio', () => {
      el._click({ target: { dataset: { action: 'fit-to-viewer' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoomTo).to.have.been.calledWith(0.5);
    });

    test('fit-to-real-size calls _el.zoomTo(1)', () => {
      el._click({ target: { dataset: { action: 'fit-to-real-size' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoomTo).to.have.been.calledWith(1);
    });

    test('rotate-left calls _el.rotate(-90)', () => {
      el._click({ target: { dataset: { action: 'rotate-left' }, parentNode: { dataset: {} } } });
      expect(mockEl.rotate).to.have.been.calledWith(-90);
    });

    test('rotate-right calls _el.rotate(90)', () => {
      el._click({ target: { dataset: { action: 'rotate-right' }, parentNode: { dataset: {} } } });
      expect(mockEl.rotate).to.have.been.calledWith(90);
    });

    test('pan-left moves the canvas towards the right', () => {
      el._click({ target: { dataset: { action: 'pan-left' }, parentNode: { dataset: {} } } });
      const [offsetX, offsetY] = mockEl.move.firstCall.args;
      expect(offsetX).to.be.greaterThan(0);
      expect(offsetY).to.equal(0);
    });

    test('pan-right moves the canvas towards the left', () => {
      el._click({ target: { dataset: { action: 'pan-right' }, parentNode: { dataset: {} } } });
      const [offsetX, offsetY] = mockEl.move.firstCall.args;
      expect(offsetX).to.be.lessThan(0);
      expect(offsetY).to.equal(0);
    });

    test('pan-up moves the canvas downwards', () => {
      el._click({ target: { dataset: { action: 'pan-up' }, parentNode: { dataset: {} } } });
      const [offsetX, offsetY] = mockEl.move.firstCall.args;
      expect(offsetX).to.equal(0);
      expect(offsetY).to.be.greaterThan(0);
    });

    test('pan-down moves the canvas upwards', () => {
      el._click({ target: { dataset: { action: 'pan-down' }, parentNode: { dataset: {} } } });
      const [offsetX, offsetY] = mockEl.move.firstCall.args;
      expect(offsetX).to.equal(0);
      expect(offsetY).to.be.lessThan(0);
    });

    test('unknown action does not call any method', () => {
      el._click({ target: { dataset: { action: 'unknown' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoom).not.to.have.been.called;
      expect(mockEl.zoomTo).not.to.have.been.called;
      expect(mockEl.rotate).not.to.have.been.called;
      expect(mockEl.move).not.to.have.been.called;
    });

    test('falls back to parentNode dataset when target has no action', () => {
      el._click({ target: { dataset: {}, parentNode: { dataset: { action: 'zoom-in' } } } });
      expect(mockEl.zoom).to.have.been.calledWith(0.1);
    });

    test('always calls _scheduleToolbarContrastUpdate', () => {
      el._click({ target: { dataset: { action: 'zoom-in' }, parentNode: { dataset: {} } } });
      expect(el._scheduleToolbarContrastUpdate).to.have.been.calledOnce;
    });
  });

  suite('_pan', () => {
    let mockEl;

    setup(() => {
      mockEl = { move: sinon.spy() };
      el._el = mockEl;
    });

    test('does nothing when _el is not set', () => {
      el._el = null;
      el._pan('pan-left');
    });

    test('does nothing for an unknown direction', () => {
      el._pan('pan-sideways');
      expect(mockEl.move).not.to.have.been.called;
    });

    test('scales the step with the size of the viewer', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(1000);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(500);
      el._pan('pan-right');
      const [offsetX] = mockEl.move.firstCall.args;
      expect(offsetX).to.equal(-200);
    });

    test('falls back to a minimum step in a very small viewer', () => {
      sandbox.stub(el.$.canvas, 'offsetWidth').value(10);
      sandbox.stub(el.$.canvas, 'offsetHeight').value(10);
      el._pan('pan-down');
      const [, offsetY] = mockEl.move.firstCall.args;
      expect(offsetY).to.equal(-24);
    });
  });

  suite('_applyToolbarTheme', () => {
    test('does nothing when theme is null', () => {
      const updateSpy = sandbox.spy(el, 'updateStyles');
      el._applyToolbarTheme(null);
      expect(updateSpy).not.to.have.been.called;
    });

    test('does nothing when theme is undefined', () => {
      const updateSpy = sandbox.spy(el, 'updateStyles');
      el._applyToolbarTheme(undefined);
      expect(updateSpy).not.to.have.been.called;
    });

    test('applies CSS variables for a valid dark theme', () => {
      const updateSpy = sandbox.spy(el, 'updateStyles');
      const theme = el._getThemeByName('dark');
      el._applyToolbarTheme(theme);
      expect(updateSpy).to.have.been.calledOnce;
      const styles = updateSpy.firstCall.args[0];
      expect(styles['--nuxeo-image-viewer-toolbar-color']).to.equal('#ffffff');
      expect(styles['--nuxeo-image-viewer-toolbar-ink-color']).to.equal('#ffffff');
      expect(styles['--nuxeo-image-viewer-toolbar-icon-shadow']).to.include('drop-shadow');
    });

    test('applies CSS variables for a valid light theme', () => {
      const updateSpy = sandbox.spy(el, 'updateStyles');
      const theme = el._getThemeByName('light');
      el._applyToolbarTheme(theme);
      expect(updateSpy).to.have.been.calledOnce;
      const styles = updateSpy.firstCall.args[0];
      expect(styles['--nuxeo-image-viewer-toolbar-color']).to.equal('#111111');
    });
  });

  suite('_init', () => {
    test('destroys existing _el before creating a new one', () => {
      const destroySpy = sinon.spy();
      el._el = { destroy: destroySpy };
      el.src = 'http://example.com/img.png';
      el._init();
      expect(destroySpy).to.have.been.calledOnce;
    });

    test('does not create cropper when src is falsy', () => {
      el._el = null;
      el.src = '';
      el._init();
      expect(el._el).to.be.null;
    });

    test('skips destroy when _el is null', () => {
      el._el = null;
      el.src = '';
      el._init();
      expect(el._el).to.be.null;
    });
  });

  suite('_resize', () => {
    test('does nothing when _el is null', () => {
      el._el = null;
      el._resize();
    });

    test('does nothing when canvas is not visible', () => {
      el._el = { resize: sinon.spy(), zoomTo: sinon.spy() };
      sandbox.stub(el, '_isCanvasVisible').returns(false);
      el._resize();
      expect(el._el.resize).not.to.have.been.called;
    });

    test('resizes and resets zoom when canvas is visible', () => {
      const mockEl = {
        resize: sinon.spy(),
        zoomTo: sinon.spy(),
        initialCanvasData: { width: 500, naturalWidth: 1000 },
      };
      el._el = mockEl;
      sandbox.stub(el, '_isCanvasVisible').returns(true);
      sandbox.stub(el, '_scheduleToolbarContrastUpdate');
      el._resize();
      expect(mockEl.resize).to.have.been.calledOnce;
      expect(mockEl.zoomTo).to.have.been.calledWith(0.5);
      expect(el._fitToRealSize).to.be.false;
    });
  });

  suite('_scheduleToolbarContrastUpdate', () => {
    test('cancels previous frame before scheduling new one', () => {
      const cancelSpy = sandbox.spy(window, 'cancelAnimationFrame');
      el.__toolbarContrastFrame = 999;
      el._scheduleToolbarContrastUpdate();
      expect(cancelSpy).to.have.been.calledWith(999);
    });

    test('does not cancel when no pending frame', () => {
      const cancelSpy = sandbox.spy(window, 'cancelAnimationFrame');
      el.__toolbarContrastFrame = null;
      el._scheduleToolbarContrastUpdate();
      expect(cancelSpy).not.to.have.been.called;
    });
  });

  suite('_updateToolbarContrast', () => {
    test('returns early when controls is false', () => {
      el.controls = false;
      el._el = {};
      const spy = sandbox.spy(el, '_getToolbarBackgroundLuminance');
      el._updateToolbarContrast();
      expect(spy).not.to.have.been.called;
    });

    test('returns early when _el is null', () => {
      el.controls = true;
      el._el = null;
      const spy = sandbox.spy(el, '_applyToolbarTheme');
      el._updateToolbarContrast();
      expect(spy).not.to.have.been.called;
    });

    test('applies dark theme when luminance is null', () => {
      el.controls = true;
      el._el = {};
      sandbox.stub(el, '_getToolbarBackgroundLuminance').returns(null);
      const spy = sandbox.spy(el, '_applyToolbarTheme');
      el._updateToolbarContrast();
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].iconColor).to.equal('#ffffff');
    });

    test('selects best theme when luminance is available', () => {
      el.controls = true;
      el._el = {};
      sandbox.stub(el, '_getToolbarBackgroundLuminance').returns(0.5);
      const spy = sandbox.spy(el, '_applyToolbarTheme');
      el._updateToolbarContrast();
      expect(spy).to.have.been.calledOnce;
    });
  });

  suite('_getToolbarBackgroundLuminance', () => {
    test('returns null when shadowRoot has no toolbar', () => {
      el.controls = true;
      el._el = {};
      expect(el._getToolbarBackgroundLuminance()).to.be.null;
    });

    test('returns null when image has no naturalWidth', () => {
      el._el = {
        getCanvasData: () => {
          return { width: 100, height: 100 };
        },
      };
      Object.defineProperty(el.$.image, 'naturalWidth', { value: 0, configurable: true });
      expect(el._getToolbarBackgroundLuminance()).to.be.null;
    });
  });
});
