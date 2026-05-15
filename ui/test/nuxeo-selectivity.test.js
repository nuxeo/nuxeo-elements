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

import {
  fixture,
  flush,
  html,
  pressAndReleaseKeyOn,
  waitForAttrMutation,
  waitForChildListMutation,
} from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { escapeHTML } from '../widgets/nuxeo-selectivity.js';

/**
 * Tests for `<nuxeo-selectivity>`.
 *
 * The tests are organised in two layers:
 *   1. Integration tests that exercise the underlying selectivity.js DOM (single/multiple
 *      selection, programmatic value changes, backspace deletion).
 *   2. Unit tests on the public/internal methods of the Polymer element
 *      (`_idFunction`, `_resolveEntry`, `_selectionFormatter`, `_resultFormatter`,
 *      `_newEntryFormatter`, `_wrap`, `_getValidity`, `_syncInputAriaLabel`,
 *      `_placeholderChanged`, `_initSelection`, `escapeHTML`, ...).
 *
 * Assertions are aligned with the current implementation in `ui/widgets/nuxeo-selectivity.js`.
 */
suite('nuxeo-selectivity', () => {
  let selectivityWidget;
  const data = ['Berlin', 'Lisbon', 'London', 'Rennes', 'Rome'];

  // --------------------------------------------------------------------------
  // Integration: single value mode
  // --------------------------------------------------------------------------
  suite('single value', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Its value can be set programmatically multiple times', () => {
      const getSelectedItem = () => dom(selectivityWidget.root).querySelector('.selectivity-single-selected-item');
      const resetValue = () =>
        dom(selectivityWidget.root)
          .querySelector('a.selectivity-single-selected-item-remove')
          .click();
      for (let i = 0; i < data.length; i++) {
        selectivityWidget.value = data[i];
        const item = getSelectedItem();
        expect(item).not.to.be.equal(null);
        expect(item.textContent).to.be.equal(data[i]);
        resetValue();
        expect(getSelectedItem()).to.be.equal(null);
      }
    });

    test('Programmatically clearing the value removes the selection', () => {
      const getSelectedItem = () => dom(selectivityWidget.root).querySelector('.selectivity-single-selected-item');
      selectivityWidget.value = 'Berlin';
      expect(getSelectedItem()).to.not.be.equal(null);
      selectivityWidget.value = null;
      expect(getSelectedItem()).to.be.equal(null);
    });
  });

  // --------------------------------------------------------------------------
  // Integration: multiple value mode
  // --------------------------------------------------------------------------
  suite('multiple value', () => {
    const getSelectedItems = () => dom(selectivityWidget.root).querySelectorAll('.selectivity-multiple-selected-item');

    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data} multiple></nuxeo-selectivity>
      `);
    });

    test('Backspace higlights and then deletes a single value', async () => {
      const hitBackspace = () =>
        pressAndReleaseKeyOn(dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input'), 8);

      // set initial value with two entries
      selectivityWidget.value = ['Berlin', 'Lisbon'];
      await flush();

      // ensure that both are present and none are highlighted, then hit backspace
      let items = getSelectedItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].textContent).to.be.equal('Berlin');
      expect(items[1].textContent).to.be.equal('Lisbon');
      expect(items[1].classList.contains('highlighted')).to.be.false;
      dom(selectivityWidget.root)
        .querySelector('input.selectivity-multiple-input')
        .focus();
      hitBackspace();
      await flush();

      // assert that there's still two entries but the last one is highlighted, then hit backspace again
      items = getSelectedItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].textContent).to.be.equal('Berlin');
      expect(items[1].textContent).to.be.equal('Lisbon');
      if (!items[1].classList.contains('highlighted')) {
        // we might have to wait for the attribute to be changed on slower browsers
        await waitForAttrMutation(items[1], 'class');
      }
      expect(items[1].classList.contains('highlighted')).to.be.true;
      dom(selectivityWidget.root)
        .querySelector('input.selectivity-multiple-input')
        .focus();
      hitBackspace();
      await flush();

      // check there's only one entry left
      items = getSelectedItems();
      if (items.length !== 1) {
        // we might have to wait for the entries to be removed on slower browsers
        await waitForChildListMutation(
          dom(selectivityWidget.root).querySelector('.selectivity-multiple-input-container'),
        );
        items = getSelectedItems();
      }
      expect(items.length).to.be.equal(1);
      expect(items[0].textContent).to.be.equal('Berlin');
    });

    test('Programmatically setting the value renders the corresponding selected items', async () => {
      selectivityWidget.value = ['Berlin', 'Rome'];
      await flush();
      const items = getSelectedItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].textContent).to.be.equal('Berlin');
      expect(items[1].textContent).to.be.equal('Rome');
    });
  });

  // --------------------------------------------------------------------------
  // Unit: idFunction / _idFunction
  // --------------------------------------------------------------------------
  suite('idFunction', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data}></nuxeo-selectivity>
      `);
    });

    test('returns primitive values as-is', () => {
      expect(selectivityWidget.idFunction('hello')).to.equal('hello');
      expect(selectivityWidget.idFunction(42)).to.equal(42);
      expect(selectivityWidget.idFunction(null)).to.equal(null);
      expect(selectivityWidget.idFunction(undefined)).to.equal(undefined);
    });

    test('returns the whole object when none of the known identifier keys are present', () => {
      const item = { unknown: 'id', keyOne: 'valueOne', keyTwo: 'valueTwo' };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
    });

    test('returns the value when a known identifier holds an empty string', () => {
      expect(selectivityWidget.idFunction({ uid: '' })).to.equal('');
      expect(selectivityWidget.idFunction({ id: '' })).to.equal('');
    });

    test('returns zero when a known identifier holds 0', () => {
      expect(selectivityWidget.idFunction({ id: 0 })).to.equal(0);
    });

    test('returns the whole object when a known identifier is set but contains null', () => {
      // The implementation skips identifiers whose value is null/undefined so that the
      // dropdown can resolve the entry from the rest of the object instead of being
      // keyed by a falsy primitive.
      const item = { id: null };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
    });

    test('returns the whole object when a known identifier is set but contains undefined', () => {
      const item = { computeId: undefined };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
    });

    test('returns the whole object when all known identifiers are null/undefined', () => {
      const item = { computeId: null, uid: null, id: undefined };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
    });

    test('returns computeId value when all known identifiers are present', () => {
      const item = { uid: 'two', id: 'three', computeId: 'one' };
      expect(selectivityWidget.idFunction(item)).to.equal('one');
    });

    test('returns uid value when only uid and id are present', () => {
      const item = { id: 'three', uid: 'two' };
      expect(selectivityWidget.idFunction(item)).to.equal('two');
    });

    test('returns id value when only id is present', () => {
      expect(selectivityWidget.idFunction({ id: 'three' })).to.equal('three');
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _resolveEntry
  // --------------------------------------------------------------------------
  suite('_resolveEntry', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('returns null when no entry is provided', () => {
      expect(selectivityWidget._resolveEntry(null)).to.equal(null);
      expect(selectivityWidget._resolveEntry(undefined)).to.equal(null);
      expect(selectivityWidget._resolveEntry('')).to.equal(null);
    });

    test('returns the matching item from data when found', () => {
      expect(selectivityWidget._resolveEntry('Berlin')).to.equal('Berlin');
    });

    test('returns a synthesised entry when no matching item is found in data', () => {
      const result = selectivityWidget._resolveEntry('Atlantis');
      expect(result).to.be.an('object');
      expect(result.id).to.equal('Atlantis');
      expect(result.text).to.equal('Atlantis');
      expect(result.displayLabel).to.equal('Atlantis');
    });

    test('uses the idFunction of an object entry to look up the existing data', async () => {
      const objectData = [
        { id: 'a', displayLabel: 'A' },
        { id: 'b', displayLabel: 'B' },
      ];
      const widget = await fixture(
        html`
          <nuxeo-selectivity .data=${objectData}></nuxeo-selectivity>
        `,
      );
      const resolved = widget._resolveEntry('a');
      expect(resolved).to.equal(objectData[0]);
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _initSelection
  // --------------------------------------------------------------------------
  suite('_initSelection', () => {
    test('resolves a single value and forwards it to the callback', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const cb = sinon.spy();
      selectivityWidget._initSelection('Berlin', cb);
      expect(cb).to.have.been.calledOnceWith('Berlin');
    });

    test('forwards a null resolved value to the callback in single mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const cb = sinon.spy();
      selectivityWidget._initSelection(null, cb);
      expect(cb).to.have.been.calledOnceWith(null);
    });

    test('resolves every value when multiple is true', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      const cb = sinon.spy();
      selectivityWidget._initSelection(['Berlin', 'Lisbon'], cb);
      expect(cb).to.have.been.calledOnce;
      const [resolved] = cb.firstCall.args;
      expect(resolved).to.deep.equal(['Berlin', 'Lisbon']);
    });

    test('drops falsy resolved entries when multiple is true', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity multiple></nuxeo-selectivity>
      `);
      sinon.stub(selectivityWidget, 'resolveEntry').callsFake((v) => (v === 'keep' ? { id: v } : null));
      const cb = sinon.spy();
      selectivityWidget._initSelection(['keep', 'drop'], cb);
      const [resolved] = cb.firstCall.args;
      expect(resolved).to.have.lengthOf(1);
      expect(resolved[0]).to.deep.equal({ id: 'keep' });
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _getValidity
  // --------------------------------------------------------------------------
  suite('_getValidity', () => {
    test('returns true when the widget is not required', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('returns false when required and no value is set (single)', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = null;
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('returns true when required and a value is set (single)', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = 'Berlin';
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('returns false when required, multiple and value is empty array', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data} multiple required></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = [];
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('returns true when required, multiple and value has entries', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data} multiple required></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = ['Berlin'];
      expect(selectivityWidget._getValidity()).to.be.true;
    });
  });

  // --------------------------------------------------------------------------
  // Unit: formatters
  // --------------------------------------------------------------------------
  suite('formatters', () => {
    setup(async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
    });

    test('_selectionFormatter prefers displayLabel, then title, then text, then the item', () => {
      expect(selectivityWidget._selectionFormatter({ displayLabel: 'A', title: 'B' })).to.equal('A');
      expect(selectivityWidget._selectionFormatter({ title: 'B', text: 'C' })).to.equal('B');
      expect(selectivityWidget._selectionFormatter({ text: 'C' })).to.equal('C');
      expect(selectivityWidget._selectionFormatter('plain')).to.equal('plain');
    });

    test('_resultFormatter prefers displayLabel, then title, then text, then the item', () => {
      expect(selectivityWidget._resultFormatter({ displayLabel: 'A' })).to.equal('A');
      expect(selectivityWidget._resultFormatter({ title: 'B' })).to.equal('B');
      expect(selectivityWidget._resultFormatter({ text: 'C' })).to.equal('C');
      expect(selectivityWidget._resultFormatter('plain')).to.equal('plain');
    });

    test('_newEntryFormatter returns an object with id and displayLabel set to the search term', () => {
      expect(selectivityWidget._newEntryFormatter('foo')).to.deep.equal({ id: 'foo', displayLabel: 'foo' });
    });

    test('formatters escape HTML markup in their output', () => {
      const escaped = selectivityWidget._selectionFormatter({ displayLabel: '<b>x</b>' });
      expect(escaped).to.not.contain('<b>');
      expect(escaped).to.contain('&lt;');
      expect(escaped).to.contain('&gt;');
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _wrap
  // --------------------------------------------------------------------------
  suite('_wrap', () => {
    setup(async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
    });

    test('wraps a primitive into an entry with id, text, item and depth', () => {
      const [wrapped] = selectivityWidget._wrap(['Berlin']);
      expect(wrapped.id).to.equal('Berlin');
      expect(wrapped.text).to.equal('Berlin');
      expect(wrapped.item).to.equal('Berlin');
      expect(wrapped.depth).to.equal(0);
    });

    test('wraps an object using displayLabel as text when available', () => {
      const [wrapped] = selectivityWidget._wrap([{ id: '1', displayLabel: 'One' }]);
      expect(wrapped.id).to.equal('1');
      expect(wrapped.text).to.equal('One');
      expect(wrapped.depth).to.equal(0);
    });

    test('recurses through children and increments depth', () => {
      const [wrapped] = selectivityWidget._wrap([
        { id: 'root', children: [{ id: 'child', children: [{ id: 'grand' }] }] },
      ]);
      expect(wrapped.depth).to.equal(0);
      expect(wrapped.children[0].depth).to.equal(1);
      expect(wrapped.children[0].children[0].depth).to.equal(2);
    });

    test('wraps a single object when called with a non-array value', () => {
      const wrapped = selectivityWidget._wrap({ id: 'one' });
      expect(wrapped).to.be.an('object');
      expect(wrapped.id).to.equal('one');
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _placeholderChanged / _syncInputAriaLabel
  // --------------------------------------------------------------------------
  suite('placeholder and aria-label', () => {
    test('placeholder is propagated to the single-select input', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city" .data=${data}></nuxeo-selectivity>
      `);
      const input = selectivityWidget.shadowRoot.querySelector('.selectivity-single-select-input');
      expect(input).to.not.be.null;
      expect(input.getAttribute('aria-label')).to.equal('No city');
    });

    test('placeholder is propagated to the multiple input when multiple is true', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="Select cities" .data=${data} multiple></nuxeo-selectivity>
      `);
      const input = selectivityWidget.shadowRoot.querySelector('.selectivity-multiple-input');
      expect(input).to.not.be.null;
      expect(input.getAttribute('placeholder')).to.equal('Select cities');
    });

    test('label takes precedence over placeholder for aria-label', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity label="Authors" placeholder="Select authors" .data=${data}></nuxeo-selectivity>
      `);
      const input = selectivityWidget.shadowRoot.querySelector('.selectivity-single-select-input');
      expect(input.getAttribute('aria-label')).to.equal('Authors');
    });

    test('changing the label updates the aria-label on the input', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="Pick one" .data=${data}></nuxeo-selectivity>
      `);
      const input = selectivityWidget.shadowRoot.querySelector('.selectivity-single-select-input');
      expect(input.getAttribute('aria-label')).to.equal('Pick one');
      selectivityWidget.label = 'New Label';
      expect(input.getAttribute('aria-label')).to.equal('New Label');
    });

    test('aria-label is removed when both label and placeholder are empty', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder=" " .data=${data}></nuxeo-selectivity>
      `);
      const input = selectivityWidget.shadowRoot.querySelector('.selectivity-single-select-input');
      expect(input.hasAttribute('aria-label')).to.be.false;
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _query
  // --------------------------------------------------------------------------
  suite('_query', () => {
    test('returns local results when data is provided', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      const callback = sinon.spy();
      selectivityWidget._query({ term: '', callback });
      expect(callback).to.have.been.calledOnce;
      const { results } = callback.firstCall.args[0];
      expect(results).to.have.lengthOf(data.length);
      expect(results[0].id).to.equal('Berlin');
    });

    test('returns no results when neither data nor operation is provided', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
      const callback = sinon.spy();
      selectivityWidget._query({ term: 'foo', callback });
      expect(callback).to.have.been.calledOnce;
      expect(callback.firstCall.args[0].results).to.have.lengthOf(0);
    });

    test('appends a tag entry when tagging is true and no result matches the term', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${[]} tagging></nuxeo-selectivity>
        `,
      );
      const callback = sinon.spy();
      selectivityWidget._query({ term: 'newTag', callback });
      const { results } = callback.firstCall.args[0];
      expect(results).to.have.lengthOf(1);
      expect(results[0].id).to.equal('newTag');
    });

    test('applies the queryResultsFilter to local results', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      selectivityWidget.queryResultsFilter = (item) => item.startsWith('L');
      const callback = sinon.spy();
      selectivityWidget._query({ term: '', callback });
      const { results } = callback.firstCall.args[0];
      const ids = results.map((r) => r.id);
      expect(ids).to.deep.equal(['Lisbon', 'London']);
    });

    test('uses the operation when no data is provided', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      const opEl = selectivityWidget.$.op;
      const executeStub = sinon.stub(opEl, 'execute').resolves({
        entries: [{ id: 'a', displayLabel: 'A' }],
      });
      const callback = sinon.spy();
      selectivityWidget._query({ term: 'test', callback });
      await executeStub.returnValues[0];
      expect(executeStub).to.have.been.calledOnce;
      expect(callback).to.have.been.calledOnce;
      const { results } = callback.firstCall.args[0];
      expect(results).to.have.lengthOf(1);
      expect(results[0].id).to.equal('a');
      executeStub.restore();
    });

    test('handles a non-array response from the operation', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      const opEl = selectivityWidget.$.op;
      const executeStub = sinon.stub(opEl, 'execute').resolves([{ id: 'a' }]);
      const callback = sinon.spy();
      selectivityWidget._query({ term: 'test', callback });
      await executeStub.returnValues[0];
      expect(callback).to.have.been.calledOnce;
      executeStub.restore();
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _dataChanged
  // --------------------------------------------------------------------------
  suite('_dataChanged', () => {
    test('wraps a non-array, non-null data value into an array', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
      selectivityWidget.data = { id: 'one' };
      expect(Array.isArray(selectivityWidget.data)).to.be.true;
      expect(selectivityWidget.data).to.have.lengthOf(1);
    });

    test('leaves an array data value as-is', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
      const items = [{ id: 'one' }, { id: 'two' }];
      selectivityWidget.data = items;
      expect(selectivityWidget.data).to.equal(items);
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _valueChanged behaviour with the selectivity instance
  // --------------------------------------------------------------------------
  suite('_valueChanged', () => {
    test('forwards a non-empty value to the underlying selectivity instance', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      const setValueSpy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget.value = 'Berlin';
      expect(setValueSpy).to.have.been.calledWith('Berlin', { triggerChange: false });
      setValueSpy.restore();
    });

    test('clears the underlying selectivity instance when the value becomes null', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = 'Berlin';
      const clearSpy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget.value = null;
      expect(clearSpy).to.have.been.calledOnce;
      expect(selectivityWidget.selectedItem).to.equal(null);
      clearSpy.restore();
    });

    test('resets selectedItems when value becomes null in multiple mode', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
        `,
      );
      selectivityWidget.value = ['Berlin'];
      await flush();
      selectivityWidget.value = null;
      expect(selectivityWidget.selectedItems).to.deep.equal([]);
    });
  });

  // --------------------------------------------------------------------------
  // Unit: escapeHTML (module export + instance method)
  // --------------------------------------------------------------------------
  suite('escapeHTML', () => {
    test('escapes the standard HTML special characters', () => {
      expect(escapeHTML('&')).to.equal('&amp;');
      expect(escapeHTML('<')).to.equal('&lt;');
      expect(escapeHTML('>')).to.equal('&gt;');
      expect(escapeHTML('"')).to.equal('&quot;');
      expect(escapeHTML("'")).to.equal('&#39;');
      expect(escapeHTML('/')).to.equal('&#47;');
      expect(escapeHTML('\\')).to.equal('&#92;');
    });

    test('escapes a complete script tag injection', () => {
      const result = escapeHTML('<script>alert("xss")</script>');
      expect(result).to.not.contain('<script>');
      expect(result).to.contain('&lt;');
      expect(result).to.contain('&gt;');
    });

    test('returns non-string values unchanged', () => {
      expect(escapeHTML(123)).to.equal(123);
      expect(escapeHTML(null)).to.equal(null);
      expect(escapeHTML(undefined)).to.equal(undefined);
      expect(escapeHTML(true)).to.equal(true);
      const obj = { id: 'x' };
      expect(escapeHTML(obj)).to.equal(obj);
    });

    test('returns the empty string unchanged', () => {
      expect(escapeHTML('')).to.equal('');
    });

    test('is exposed as an instance method that delegates to the module function', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
      expect(selectivityWidget.escapeHTML('<x>')).to.equal(escapeHTML('<x>'));
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _readonlyChanged
  // --------------------------------------------------------------------------
  suite('_readonlyChanged', () => {
    test('forwards the readonly flag to the underlying selectivity instance', async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
        `,
      );
      const setOptionsSpy = sinon.spy(selectivityWidget._selectivity, 'setOptions');
      selectivityWidget.readonly = true;
      expect(setOptionsSpy).to.have.been.calledOnce;
      const [opts] = setOptionsSpy.firstCall.args;
      expect(opts.readOnly).to.be.true;
      setOptionsSpy.restore();
    });
  });

  // --------------------------------------------------------------------------
  // Unit: _triggerQueryCallback edge cases
  // --------------------------------------------------------------------------
  suite('_triggerQueryCallback', () => {
    setup(async () => {
      selectivityWidget = await fixture(
        html`
          <nuxeo-selectivity></nuxeo-selectivity>
        `,
      );
    });

    test('forwards results without modification when no filter is set', () => {
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: '', callback }, ['a', 'b']);
      const { results } = callback.firstCall.args[0];
      expect(results.map((r) => r.id)).to.deep.equal(['a', 'b']);
    });

    test('appends a new tag entry when tagging is true and the term is not in the results', () => {
      selectivityWidget.tagging = true;
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: 'fresh', callback }, []);
      const { results } = callback.firstCall.args[0];
      expect(results).to.have.lengthOf(1);
      expect(results[0].id).to.equal('fresh');
    });

    test('does not append a tag when the term already matches a result id', () => {
      selectivityWidget.tagging = true;
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: 'a', callback }, [{ id: 'a' }]);
      const { results } = callback.firstCall.args[0];
      expect(results).to.have.lengthOf(1);
    });
  });
});
