/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-checkmark.js';

suite('nuxeo-checkmark extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-checkmark></nuxeo-checkmark>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.CheckMark.is).to.equal('nuxeo-checkmark');
  });

  test('should have expected default property values', () => {
    expect(Nuxeo.CheckMark.properties.checked.value).to.be.false;
    expect(Nuxeo.CheckMark.properties.disabled.value).to.be.false;
  });

  test('ready sets ARIA attributes', () => {
    expect(el.getAttribute('role')).to.equal('checkbox');
    expect(el.getAttribute('aria-checked')).to.equal('false');
    expect(el.getAttribute('tabindex')).to.equal('0');
  });

  suite('_tap', () => {
    test('toggles checked state when not disabled', () => {
      el.checked = false;
      el._tap();
      expect(el.checked).to.be.true;
      el._tap();
      expect(el.checked).to.be.false;
    });

    test('does nothing when disabled', () => {
      el.disabled = true;
      el.checked = false;
      el._tap();
      expect(el.checked).to.be.false;
    });

    test('blurs when toggled off via mouse', () => {
      el.checked = true;
      const blurSpy = sinon.spy(el, 'blur');
      el._tap(false);
      expect(el.checked).to.be.false;
      expect(blurSpy).to.have.been.called;
      blurSpy.restore();
    });

    test('does not blur when toggled via keyboard', () => {
      el.checked = true;
      const blurSpy = sinon.spy(el, 'blur');
      el._tap(true);
      expect(el.checked).to.be.false;
      expect(blurSpy).to.not.have.been.called;
      blurSpy.restore();
    });

    test('does not blur when toggling to checked', () => {
      el.checked = false;
      const blurSpy = sinon.spy(el, 'blur');
      el._tap(false);
      expect(el.checked).to.be.true;
      expect(blurSpy).to.not.have.been.called;
      blurSpy.restore();
    });
  });

  suite('_onKeyDown', () => {
    test('triggers tap on Enter', () => {
      el.checked = false;
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      sinon.spy(event, 'preventDefault');
      el._onKeyDown(event);
      expect(el.checked).to.be.true;
      expect(event.preventDefault).to.have.been.called;
    });

    test('triggers tap on Space', () => {
      el.checked = false;
      const event = new KeyboardEvent('keydown', { key: ' ' });
      el._onKeyDown(event);
      expect(el.checked).to.be.true;
    });

    test('triggers tap on Spacebar (legacy)', () => {
      el.checked = false;
      const event = new KeyboardEvent('keydown', { key: 'Spacebar' });
      el._onKeyDown(event);
      expect(el.checked).to.be.true;
    });

    test('does nothing on other keys', () => {
      el.checked = false;
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      el._onKeyDown(event);
      expect(el.checked).to.be.false;
    });
  });

  suite('_ariaChecked observer', () => {
    test('reflects checked into aria-checked', () => {
      el.checked = true;
      expect(el.getAttribute('aria-checked')).to.equal('true');
      el.checked = false;
      expect(el.getAttribute('aria-checked')).to.equal('false');
    });

    test('blurs when unchecked through data binding (e.g. table/select-all deselect)', () => {
      el.checked = true;
      const blurSpy = sinon.spy(el, 'blur');
      // Simulate a deselection propagated via binding rather than a mouse tap.
      el.checked = false;
      expect(blurSpy).to.have.been.called;
      blurSpy.restore();
    });

    test('does not blur when checked through data binding', () => {
      el.checked = false;
      const blurSpy = sinon.spy(el, 'blur');
      el.checked = true;
      expect(blurSpy).to.not.have.been.called;
      blurSpy.restore();
    });
  });
});
