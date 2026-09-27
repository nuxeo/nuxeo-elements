/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-column-filter.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

suite('nuxeo-data-table-column-filter (WEBUI-1885)', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-data-table-column-filter label="Title"></nuxeo-data-table-column-filter>
      `,
    );
    await flush();
  });

  suite('_valueChanged', () => {
    test('ignores paper-input init when both incoming and current value are empty', () => {
      el.value = '';
      el._valueChanged({ detail: { value: '' } });
      expect(el._debouncer == null || !el._debouncer.isActive()).to.be.true;
    });

    test('ignores paper-input init when incoming is empty and current is unset', () => {
      el.value = undefined;
      el._valueChanged({ detail: { value: '' } });
      expect(el._debouncer == null || !el._debouncer.isActive()).to.be.true;
    });

    test('ignores echo events where incoming value matches current value', () => {
      el.value = 'foo';
      el._valueChanged({ detail: { value: 'foo' } });
      expect(el._debouncer == null || !el._debouncer.isActive()).to.be.true;
    });

    test('schedules a debounced update for a new non-empty value', () => {
      el.value = '';
      el._valueChanged({ detail: { value: 'hello' } });
      expect(el._debouncer).to.exist;
      expect(el._debouncer.isActive()).to.be.true;
    });

    test('propagates the new value to this.value after the debounce', async () => {
      el.value = '';
      el._valueChanged({ detail: { value: 'hello' } });
      // Debounce is 250ms; wait a bit longer
      await sleep(300);
      expect(el.value).to.equal('hello');
    });

    test('clearing a previously set filter (non-empty -> empty) is propagated', async () => {
      el.value = 'hello';
      el._valueChanged({ detail: { value: '' } });
      await sleep(300);
      expect(el.value).to.equal('');
    });
  });

  suite('_valuePropertyChanged', () => {
    test('cancels a pending debounced propagation when value is set externally', () => {
      // Arrange: simulate a pending debouncer from a previous _valueChanged
      el.value = '';
      el._valueChanged({ detail: { value: 'stale' } });
      const debouncer = el._debouncer;
      expect(debouncer.isActive()).to.be.true;

      // Act: external set of value should cancel the stale debouncer
      el.value = 'restored';

      // Assert: the original debouncer is cancelled
      expect(debouncer.isActive()).to.be.false;
    });

    test('syncs the paper-input value to the new external value', async () => {
      el.value = 'restored';
      await flush();
      const input = el.shadowRoot.querySelector('paper-input');
      expect(input.value).to.equal('restored');
    });

    test('coerces null/undefined when assigning to a paper-input with a stale value', () => {
      const input = el.shadowRoot.querySelector('paper-input');
      input.value = 'stale';
      el._valuePropertyChanged(null);
      expect(input.value).to.equal('');
    });

    test('does not throw when called before the shadow DOM is queryable', () => {
      // Defensive: simulate the observer firing with no shadow content
      const stub = sinon.stub(el, 'shadowRoot').value(null);
      expect(() => el._valuePropertyChanged('x')).to.not.throw();
      stub.restore();
    });
  });

  suite('regression: restore-then-init order (WEBUI-1885)', () => {
    test('paper-input empty init does not clobber an externally-restored value', async () => {
      // Sequence: element is freshly stamped (value undefined) -> paper-input fires
      // its initial value-changed='' -> external code restores value='restored'.
      // The empty-when-empty guard in _valueChanged drops the init event so the
      // pending debouncer never overwrites the restored value.
      el.value = undefined;
      el._valueChanged({ detail: { value: '' } });
      el.value = 'restored';
      await sleep(300);
      expect(el.value).to.equal('restored');
    });

    test('a pending debouncer is cancelled when value is set externally', async () => {
      // If a paper-input change is in-flight when an external restore happens,
      // _valuePropertyChanged must cancel the debouncer so the restored value wins.
      el.value = '';
      el._valueChanged({ detail: { value: 'typed' } });
      el.value = 'restored';
      await sleep(300);
      expect(el.value).to.equal('restored');
    });
  });

  suite('required indicator (ELEMENTS-1891)', () => {
    test('is hidden by default', () => {
      expect(el.required).to.be.false;
      expect(el.shadowRoot.querySelector('.required-indicator').hasAttribute('hidden')).to.be.true;
    });

    test('is shown when required is set, and hidden again when cleared', async () => {
      el.required = true;
      await flush();
      const indicator = el.shadowRoot.querySelector('.required-indicator');
      expect(indicator.hasAttribute('hidden')).to.be.false;
      expect(indicator.textContent.trim()).to.equal('*');

      el.required = false;
      await flush();
      expect(indicator.hasAttribute('hidden')).to.be.true;
    });
  });
});
