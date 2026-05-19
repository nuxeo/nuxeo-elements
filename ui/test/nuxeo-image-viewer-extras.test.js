/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../viewers/nuxeo-image-viewer.js';

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

    test('unknown action does not call any method', () => {
      el._click({ target: { dataset: { action: 'unknown' }, parentNode: { dataset: {} } } });
      expect(mockEl.zoom).not.to.have.been.called;
      expect(mockEl.zoomTo).not.to.have.been.called;
      expect(mockEl.rotate).not.to.have.been.called;
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
