/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/iron-data-table.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTable(props = {}) {
  const el = await fixture(
    html`
      <nuxeo-data-table></nuxeo-data-table>
    `,
  );
  sinon.stub(el, '_columnsChanged');
  Object.keys(props).forEach((k) => {
    el[k] = props[k];
  });
  await flush();
  await sleep(50);
  return el;
}

suite('iron-data-table extras', () => {
  // ------------------------------------------------------------------
  // _computeActionsStyle
  // ------------------------------------------------------------------
  suite('_computeActionsStyle', () => {
    test('returns wide flex when both editable and orderable', async () => {
      const el = await newTable();
      el.editable = true;
      el.orderable = true;
      expect(el._computeActionsStyle()).to.equal('flex: 0 0 172px;');
    });

    test('returns narrow flex when only editable', async () => {
      const el = await newTable();
      el.editable = true;
      el.orderable = false;
      expect(el._computeActionsStyle()).to.equal('flex: 0 0 92px;');
    });

    test('returns narrow flex when only orderable', async () => {
      const el = await newTable();
      el.editable = false;
      el.orderable = true;
      expect(el._computeActionsStyle()).to.equal('flex: 0 0 92px;');
    });

    test('returns display:none when neither editable nor orderable', async () => {
      const el = await newTable();
      el.editable = false;
      el.orderable = false;
      expect(el._computeActionsStyle()).to.equal('display: none;');
    });
  });

  // ------------------------------------------------------------------
  // _computeSelectAllVisibility
  // ------------------------------------------------------------------
  suite('_computeSelectAllVisibility', () => {
    test('returns display:none when selectionEnabled is false', async () => {
      const el = await newTable();
      el.selectionEnabled = false;
      expect(el._computeSelectAllVisibility()).to.equal('display: none;');
    });

    test('returns visibility:hidden when selectionEnabled but selectAllEnabled is false', async () => {
      const el = await newTable();
      el.selectionEnabled = true;
      el.selectAllEnabled = false;
      el.multiSelection = true;
      expect(el._computeSelectAllVisibility()).to.equal('visibility: hidden;');
    });

    test('returns visibility:hidden when selectionEnabled but multiSelection is false', async () => {
      const el = await newTable();
      el.selectionEnabled = true;
      el.selectAllEnabled = true;
      el.multiSelection = false;
      expect(el._computeSelectAllVisibility()).to.equal('visibility: hidden;');
    });

    test('returns empty string when all conditions are met', async () => {
      const el = await newTable();
      el.selectionEnabled = true;
      el.selectAllEnabled = true;
      el.multiSelection = true;
      expect(el._computeSelectAllVisibility()).to.equal('');
    });
  });

  // ------------------------------------------------------------------
  // _isChecked
  // ------------------------------------------------------------------
  suite('_isChecked', () => {
    test('returns true when selectAllActive is true and excludedItems is empty', async () => {
      const el = await newTable();
      expect(el._isChecked(true, [])).to.be.true;
    });

    test('returns false when selectAllActive is true but excludedItems is non-empty', async () => {
      const el = await newTable();
      expect(el._isChecked(true, ['a'])).to.be.false;
    });

    test('returns false when selectAllActive is false', async () => {
      const el = await newTable();
      expect(el._isChecked(false, [])).to.be.false;
    });
  });

  // ------------------------------------------------------------------
  // _isEven
  // ------------------------------------------------------------------
  suite('_isEven', () => {
    test('returns true for even index', async () => {
      const el = await newTable();
      expect(el._isEven(0)).to.be.true;
      expect(el._isEven(2)).to.be.true;
      expect(el._isEven(100)).to.be.true;
    });

    test('returns false for odd index', async () => {
      const el = await newTable();
      expect(el._isEven(1)).to.be.false;
      expect(el._isEven(3)).to.be.false;
      expect(el._isEven(99)).to.be.false;
    });
  });

  // ------------------------------------------------------------------
  // _bind
  // ------------------------------------------------------------------
  suite('_bind', () => {
    test('returns item+index when index is provided', async () => {
      const el = await newTable();
      const item = { name: 'test' };
      const result = el._bind(item, 5);
      expect(result).to.deep.equal({ item, index: 5 });
    });

    test('returns column wrapper when index is undefined', async () => {
      const el = await newTable();
      const col = { name: 'title' };
      const result = el._bind(col);
      expect(result).to.deep.equal({ column: col });
    });

    test('returns item+index when index is 0 (falsy but defined)', async () => {
      const el = await newTable();
      const item = { name: 'first' };
      const result = el._bind(item, 0);
      expect(result).to.deep.equal({ item, index: 0 });
    });
  });

  // ------------------------------------------------------------------
  // _isExpanded
  // ------------------------------------------------------------------
  suite('_isExpanded', () => {
    test('returns true when item is in the array', async () => {
      const el = await newTable();
      const item = { id: 1 };
      expect(el._isExpanded(item, [item])).to.be.true;
    });

    test('returns false when item is not in the array', async () => {
      const el = await newTable();
      const item = { id: 1 };
      expect(el._isExpanded(item, [{ id: 2 }])).to.be.false;
    });

    test('returns false when items array is null', async () => {
      const el = await newTable();
      expect(el._isExpanded({ id: 1 }, null)).to.not.be.ok;
    });

    test('returns false for empty array', async () => {
      const el = await newTable();
      expect(el._isExpanded({ id: 1 }, [])).to.be.false;
    });
  });

  // ------------------------------------------------------------------
  // expandItem / collapseItem
  // ------------------------------------------------------------------
  suite('expandItem / collapseItem', () => {
    test('expandItem adds item to _expandedItems when rowDetail exists', async () => {
      const el = await newTable();
      el.rowDetail = {};
      el._expandedItems = [];
      const item = { id: 'expand-me' };

      el.expandItem(item);
      expect(el._expandedItems).to.include(item);
    });

    test('expandItem does not duplicate already expanded item', async () => {
      const el = await newTable();
      el.rowDetail = {};
      const item = { id: 'already' };
      el._expandedItems = [item];

      el.expandItem(item);
      expect(el._expandedItems.filter((i) => i === item)).to.have.lengthOf(1);
    });

    test('expandItem does nothing without rowDetail', async () => {
      const el = await newTable();
      el.rowDetail = null;
      el._expandedItems = [];
      el.expandItem({ id: 'nope' });
      expect(el._expandedItems).to.have.lengthOf(0);
    });

    test('collapseItem removes item from _expandedItems', async () => {
      const el = await newTable();
      el.rowDetail = {};
      const item = { id: 'collapse-me' };
      el._expandedItems = [item];

      el.collapseItem(item);
      expect(el._expandedItems).to.not.include(item);
    });

    test('collapseItem does nothing when item is not expanded', async () => {
      const el = await newTable();
      el.rowDetail = {};
      const item = { id: 'not-there' };
      el._expandedItems = [{ id: 'other' }];

      el.collapseItem(item);
      expect(el._expandedItems).to.have.lengthOf(1);
    });

    test('collapseItem does nothing without rowDetail', async () => {
      const el = await newTable();
      el.rowDetail = null;
      const item = { id: 'x' };
      el._expandedItems = [item];

      el.collapseItem(item);
      expect(el._expandedItems).to.have.lengthOf(1);
    });
  });

  // ------------------------------------------------------------------
  // _backupColumnsState
  // ------------------------------------------------------------------
  suite('_backupColumnsState', () => {
    test('sets hiddenBack on each column', async () => {
      const el = await newTable();
      el.columns = [{ hidden: true }, { hidden: false }, { hidden: true }];
      el._backupColumnsState();
      expect(el.columns[0].hiddenBack).to.be.true;
      expect(el.columns[1].hiddenBack).to.be.false;
      expect(el.columns[2].hiddenBack).to.be.true;
    });
  });

  // ------------------------------------------------------------------
  // _itemChanged
  // ------------------------------------------------------------------
  suite('_itemChanged', () => {
    test('updates item via index from e.target', async () => {
      const el = await newTable();
      el.items = [{ val: 'old' }, { val: 'keep' }];
      const setSpy = sinon.spy(el, 'set');

      el._itemChanged({
        target: { index: 0 },
        detail: { item: el.items[0], value: { val: 'new' } },
      });

      expect(setSpy).to.have.been.calledWith('items.0', { val: 'new' });
      setSpy.restore();
    });

    test('falls back to indexOf when e.target.index is undefined', async () => {
      const el = await newTable();
      const item = { val: 'find-me' };
      el.items = [{ val: 'other' }, item];
      const setSpy = sinon.spy(el, 'set');

      el._itemChanged({
        target: {},
        detail: { item, value: 'updated' },
      });

      expect(setSpy).to.have.been.calledWith('items.1', 'updated');
      setSpy.restore();
    });

    test('appends path when e.detail.path is provided', async () => {
      const el = await newTable();
      el.items = [{ nested: { a: 1 } }];
      const setSpy = sinon.spy(el, 'set');

      el._itemChanged({
        target: { index: 0 },
        detail: { item: el.items[0], path: 'nested.a', value: 2 },
      });

      expect(setSpy).to.have.been.calledWith('items.0.nested.a', 2);
      setSpy.restore();
    });

    test('does nothing when items is null', async () => {
      const el = await newTable();
      el.items = null;
      const setSpy = sinon.spy(el, 'set');

      el._itemChanged({
        target: { index: 0 },
        detail: { item: {}, value: 'x' },
      });

      expect(setSpy).to.not.have.been.called;
      setSpy.restore();
    });

    test('does nothing when item is not found (index < 0)', async () => {
      const el = await newTable();
      el.items = [{ val: 'a' }];
      const setSpy = sinon.spy(el, 'set');

      el._itemChanged({
        target: {},
        detail: { item: { val: 'nonexistent' }, value: 'x' },
      });

      expect(setSpy).to.not.have.been.called;
      setSpy.restore();
    });
  });

  // ------------------------------------------------------------------
  // _columnsChanged
  // ------------------------------------------------------------------
  suite('_columnsChanged', () => {
    test('sets table reference and listens to filter changes on new columns', async () => {
      const el = await newTable();
      el._columnsChanged.restore();
      const listenSpy = sinon.spy(el, 'listen');
      const col1 = document.createElement('div');
      col1.name = 'A';
      const col2 = document.createElement('div');
      col2.name = 'B';
      const cols = [col1, col2];

      el._columnsChanged(cols, null);

      cols.forEach((col) => {
        expect(col.table).to.equal(el);
      });
      expect(listenSpy.callCount).to.equal(2);
      listenSpy.restore();
    });

    test('unlistens from old columns', async () => {
      const el = await newTable();
      el._columnsChanged.restore();
      const unlistenSpy = sinon.spy(el, 'unlisten');
      const col1 = document.createElement('div');
      col1.name = 'X';
      const col2 = document.createElement('div');
      col2.name = 'Y';

      el._columnsChanged([], [col1, col2]);

      expect(unlistenSpy.callCount).to.equal(2);
      unlistenSpy.restore();
    });

    test('handles null old columns', async () => {
      const el = await newTable();
      el._columnsChanged.restore();
      const unlistenSpy = sinon.spy(el, 'unlisten');
      const col = document.createElement('div');
      col.name = 'Z';

      el._columnsChanged([col], null);

      expect(unlistenSpy).to.not.have.been.called;
      unlistenSpy.restore();
    });

    test('handles null new columns', async () => {
      const el = await newTable();
      el._columnsChanged.restore();
      const listenSpy = sinon.spy(el, 'listen');

      el._columnsChanged(null, []);

      expect(listenSpy).to.not.have.been.called;
      listenSpy.restore();
    });
  });

  // ------------------------------------------------------------------
  // _isStrictNumberString
  // ------------------------------------------------------------------
  suite('_isStrictNumberString', () => {
    test('returns true for valid number strings', async () => {
      const el = await newTable();
      expect(el._isStrictNumberString('42')).to.be.true;
      expect(el._isStrictNumberString('3.14')).to.be.true;
      expect(el._isStrictNumberString('-1')).to.be.true;
      expect(el._isStrictNumberString('0')).to.be.true;
      expect(el._isStrictNumberString(' 7 ')).to.be.true;
      expect(el._isStrictNumberString('1.0')).to.be.true;
      expect(el._isStrictNumberString('1e3')).to.be.true;
      expect(el._isStrictNumberString('+1')).to.be.true;
      expect(el._isStrictNumberString('-0')).to.be.true;
    });

    test('returns false for non-number strings', async () => {
      const el = await newTable();
      expect(el._isStrictNumberString('abc')).to.be.false;
      expect(el._isStrictNumberString('001234')).to.be.false;
      expect(el._isStrictNumberString('+001')).to.be.false;
      expect(el._isStrictNumberString('')).to.be.false;
      expect(el._isStrictNumberString('  ')).to.be.false;
      expect(el._isStrictNumberString('NaN')).to.be.false;
      expect(el._isStrictNumberString('Infinity')).to.be.false;
    });

    test('returns false for non-string types', async () => {
      const el = await newTable();
      expect(el._isStrictNumberString(42)).to.be.false;
      expect(el._isStrictNumberString(null)).to.be.false;
      expect(el._isStrictNumberString(undefined)).to.be.false;
      expect(el._isStrictNumberString(true)).to.be.false;
    });
  });

  // ------------------------------------------------------------------
  // _inferFieldTypes
  // ------------------------------------------------------------------
  suite('_inferFieldTypes', () => {
    test('infers field types from homogeneous rows', async () => {
      const el = await newTable();
      const types = el._inferFieldTypes([
        { code: '00123', qty: 10 },
        { code: '00124', qty: 11 },
      ]);

      expect(types).to.deep.equal({ code: 'string', qty: 'number' });
    });

    test('marks a field as null when rows have mixed string and number types', async () => {
      const el = await newTable();
      const types = el._inferFieldTypes([{ code: '00123' }, { code: 123 }]);

      expect(types).to.deep.equal({ code: null });
    });

    test('returns empty map for empty input', async () => {
      const el = await newTable();
      const types = el._inferFieldTypes([]);

      expect(types).to.deep.equal({});
    });

    test('ignores null, arrays and unsupported scalar types', async () => {
      const el = await newTable();
      const types = el._inferFieldTypes([null, ['x'], { code: true, meta: {} }, { code: '00123' }]);

      expect(types).to.deep.equal({ code: 'string' });
    });
  });

  // ------------------------------------------------------------------
  // cache helper methods
  // ------------------------------------------------------------------
  suite('field type cache helpers', () => {
    test('_getScalarType returns null for unsupported types', async () => {
      const el = await newTable();

      expect(el._getScalarType(true)).to.be.null;
      expect(el._getScalarType({})).to.be.null;
      expect(el._getScalarType([])).to.be.null;
    });

    test('_computeFieldTypeHintsFromStats returns null for mixed stats', async () => {
      const el = await newTable();
      const hints = el._computeFieldTypeHintsFromStats({
        code: { number: 0, string: 2 },
        qty: { number: 3, string: 0 },
        mixed: { number: 1, string: 1 },
      });

      expect(hints).to.deep.equal({ code: 'string', qty: 'number', mixed: null });
    });

    test('_ensureFieldTypeCache reuses an existing cache', async () => {
      const el = await newTable();
      el._fieldTypeStats = { code: { number: 0, string: 1 } };
      el._fieldTypeHints = { code: 'string' };
      const inferSpy = sinon.spy(el, '_inferFieldTypes');

      const hints = el._ensureFieldTypeCache();

      expect(hints).to.deep.equal({ code: 'string' });
      expect(inferSpy).to.not.have.been.called;
      inferSpy.restore();
    });

    test('_adjustFieldTypeStatsForItem removes keys when counters drop to zero', async () => {
      const el = await newTable();
      el._fieldTypeStats = { code: { number: 0, string: 1 } };

      el._adjustFieldTypeStatsForItem({ code: '001' }, -1);

      expect(el._fieldTypeStats.code).to.be.undefined;
    });

    test('_buildFieldTypeStats handles null items and duplicate keys', async () => {
      const el = await newTable();

      const emptyStats = el._buildFieldTypeStats(null);
      expect(emptyStats).to.deep.equal({});

      const stats = el._buildFieldTypeStats([null, ['x'], { code: '001' }, { code: '002' }, { qty: 3 }]);
      expect(stats).to.deep.equal({
        code: { number: 0, string: 2 },
        qty: { number: 1, string: 0 },
      });
    });

    test('_ensureFieldTypeCache builds from empty items fallback', async () => {
      const el = await newTable();
      el.items = null;
      el._fieldTypeStats = null;
      el._fieldTypeHints = null;

      const hints = el._ensureFieldTypeCache();

      expect(hints).to.deep.equal({});
      expect(el._fieldTypeStats).to.deep.equal({});
    });
  });

  // ------------------------------------------------------------------
  // _normalizeItem
  // ------------------------------------------------------------------
  suite('_normalizeItem', () => {
    test('converts string numbers to actual numbers', async () => {
      const el = await newTable();
      expect(el._normalizeItem('42')).to.equal(42);
      expect(el._normalizeItem('3.14')).to.equal(3.14);
    });

    test('leaves non-number strings as-is', async () => {
      const el = await newTable();
      expect(el._normalizeItem('hello')).to.equal('hello');
      expect(el._normalizeItem('')).to.equal('');
    });

    test('recursively normalizes arrays', async () => {
      const el = await newTable();
      const result = el._normalizeItem(['1', 'abc', '3']);
      expect(result).to.deep.equal([1, 'abc', 3]);
    });

    test('recursively normalizes object properties', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ a: '10', b: 'text', c: '0' });
      expect(result).to.deep.equal({ a: 10, b: 'text', c: 0 });
    });

    test('handles nested objects and arrays', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ list: ['5', '6'], nested: { val: '99' } });
      expect(result).to.deep.equal({ list: [5, 6], nested: { val: 99 } });
    });

    test('passes through null, undefined, and booleans unchanged', async () => {
      const el = await newTable();
      expect(el._normalizeItem(null)).to.be.null;
      expect(el._normalizeItem(undefined)).to.be.undefined;
      expect(el._normalizeItem(true)).to.be.true;
      expect(el._normalizeItem(false)).to.be.false;
    });

    test('preserves numeric-looking text with leading zeros when hint is string', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ code: '001234' }, { code: 'string' });

      expect(result).to.deep.equal({ code: '001234' });
      expect(result.code).to.be.a('string');
    });

    test('coerces numeric-looking text to number when hint is number', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ code: '001234' }, { code: 'number' });

      expect(result).to.deep.equal({ code: 1234 });
      expect(result.code).to.be.a('number');
    });

    test('falls back to round-trip heuristic for mixed type hint', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ code: '001234', count: '42' }, { code: null, count: null });

      expect(result).to.deep.equal({ code: '001234', count: 42 });
      expect(result.code).to.be.a('string');
      expect(result.count).to.be.a('number');
    });

    test('keeps original value when number-hinted field cannot be parsed', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ code: 'abc' }, { code: 'number' });

      expect(result).to.deep.equal({ code: 'abc' });
    });

    test('casts number to string when hint is string', async () => {
      const el = await newTable();
      const result = el._normalizeItem({ code: 1234 }, { code: 'string' });

      expect(result).to.deep.equal({ code: '1234' });
      expect(result.code).to.be.a('string');
    });

    test('single-column: coerces leading-zero numeric string to number', async () => {
      const el = await newTable();
      el.columns = [{}]; // single column
      const result = el._normalizeItem('001234');

      expect(result).to.equal(1234);
      expect(result).to.be.a('number');
    });

    test('single-column: coerces plain numeric string to number', async () => {
      const el = await newTable();
      el.columns = [{}]; // single column
      const result = el._normalizeItem('42');

      expect(result).to.equal(42);
      expect(result).to.be.a('number');
    });

    test('single-column: leaves non-numeric strings unchanged', async () => {
      const el = await newTable();
      el.columns = [{}]; // single column
      const result = el._normalizeItem('abc');

      expect(result).to.equal('abc');
    });

    test('multi-column: preserves leading-zero string without hint', async () => {
      const el = await newTable();
      el.columns = [{}, {}]; // two columns
      const result = el._normalizeItem('001234');

      expect(result).to.equal('001234');
      expect(result).to.be.a('string');
    });

    test('single-column: does not apply entry coercion to subfields of a complex entry', async () => {
      const el = await newTable();
      el.columns = [{}]; // single column, one-subfield complex
      const result = el._normalizeItem({ address: '007' });

      expect(result).to.deep.equal({ address: '007' });
      expect(result.address).to.be.a('string');
    });

    test('single-column: still coerces subfields that round-trip as numbers', async () => {
      const el = await newTable();
      el.columns = [{}];
      const result = el._normalizeItem({ address: '42' });

      expect(result).to.deep.equal({ address: 42 });
    });

    test('single-column: applies entry coercion to each element of a list of entries', async () => {
      const el = await newTable();
      el.columns = [{}];
      const result = el._normalizeItem(['007', '42']);

      expect(result).to.deep.equal([7, 42]);
    });

    test('single-column: does not apply entry coercion inside an array subfield', async () => {
      const el = await newTable();
      el.columns = [{}];
      const result = el._normalizeItem({ codes: ['007', '42'] });

      expect(result).to.deep.equal({ codes: ['007', 42] });
    });

    test('does not throw when columns is explicitly null', async () => {
      const el = await newTable();
      el.columns = null;

      expect(() => el._normalizeItem('007')).to.not.throw();
      expect(el._normalizeItem('007')).to.equal('007');
    });
  });

  // ------------------------------------------------------------------
  // _validateEntry
  // ------------------------------------------------------------------
  suite('_validateEntry', () => {
    function mockForm(el, { valid, index, item }) {
      const form = {
        index,
        item,
        validateItem: sinon.stub().returns(valid),
      };
      sinon.stub(el, 'getContentChildren').returns([form]);
      return form;
    }

    test('pushes a new item and preserves leading-zero strings when inferred as string', async () => {
      const el = await newTable();
      el.items = [{ code: '0001' }];
      const pushSpy = sinon.spy(el, 'push');
      mockForm(el, {
        valid: true,
        index: -1,
        item: { code: '001234' },
      });

      el._validateEntry();

      expect(pushSpy).to.have.been.calledOnce;
      expect(pushSpy.firstCall.args[0]).to.equal('items');
      expect(pushSpy.firstCall.args[1]).to.deep.equal({ code: '001234' });
      expect(pushSpy.firstCall.args[1].code).to.be.a('string');
      pushSpy.restore();
    });

    test('updates an existing item and coerces to number when inferred as number', async () => {
      const el = await newTable();
      el.items = [{ code: 100 }];
      const setSpy = sinon.spy(el, 'set');
      mockForm(el, {
        valid: true,
        index: 0,
        item: { code: '001234' },
      });

      el._validateEntry();

      expect(setSpy).to.have.been.calledOnce;
      expect(setSpy.firstCall.args[0]).to.equal('items.0');
      expect(setSpy.firstCall.args[1]).to.deep.equal({ code: 1234 });
      expect(setSpy.firstCall.args[1].code).to.be.a('number');
      setSpy.restore();
    });

    test('does nothing when form validation fails', async () => {
      const el = await newTable();
      const pushSpy = sinon.spy(el, 'push');
      const setSpy = sinon.spy(el, 'set');
      mockForm(el, {
        valid: false,
        index: -1,
        item: { code: '001234' },
      });

      el._validateEntry();

      expect(pushSpy).to.not.have.been.called;
      expect(setSpy).to.not.have.been.called;
      pushSpy.restore();
      setSpy.restore();
    });

    test('reuses cached type hints across consecutive saves', async () => {
      const el = await newTable();
      el.items = [{ code: '0001', qty: 1 }];
      const inferSpy = sinon.spy(el, '_inferFieldTypes');
      const form = {
        index: 0,
        item: { code: '0002', qty: '2' },
        validateItem: sinon.stub().returns(true),
      };
      sinon.stub(el, 'getContentChildren').returns([form]);

      el._validateEntry();
      form.item = { code: '0003', qty: '3' };
      el._validateEntry();

      expect(inferSpy.callCount).to.equal(1);
      inferSpy.restore();
    });
  });

  // ------------------------------------------------------------------
  // _deleteEntry
  // ------------------------------------------------------------------
  suite('_deleteEntry', () => {
    test('removes the selected item and notifies resize', async () => {
      const el = await newTable();
      el.items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const spliceSpy = sinon.spy(el, 'splice');
      const resizeSpy = sinon.spy(el, 'notifyResize');

      el._deleteEntry({
        stopPropagation: sinon.spy(),
        detail: { index: 1 },
      });

      expect(spliceSpy).to.have.been.calledOnceWith('items', 1, 1);
      expect(el.items).to.deep.equal([{ id: 'a' }, { id: 'c' }]);
      expect(resizeSpy).to.have.been.calledOnce;
      spliceSpy.restore();
      resizeSpy.restore();
    });
  });

  // ------------------------------------------------------------------
  // _deepCopy
  // ------------------------------------------------------------------
  suite('_deepCopy', () => {
    test('creates a deep copy of a plain object', async () => {
      const el = await newTable();
      const obj = { a: 1, b: { c: 2 } };
      const copy = el._deepCopy(obj);
      expect(copy).to.deep.equal(obj);
      expect(copy).to.not.equal(obj);
      expect(copy.b).to.not.equal(obj.b);
    });

    test('handles arrays', async () => {
      const el = await newTable();
      const arr = [1, [2, 3], { x: 4 }];
      const copy = el._deepCopy(arr);
      expect(copy).to.deep.equal(arr);
      expect(copy[1]).to.not.equal(arr[1]);
    });

    test('handles circular references by discarding them', async () => {
      const el = await newTable();
      const obj = { a: 1 };
      obj.self = obj;
      const copy = el._deepCopy(obj);
      expect(copy.a).to.equal(1);
      expect(copy.self).to.be.undefined;
    });

    test('deep copies nested circular references', async () => {
      const el = await newTable();
      const inner = { val: 10 };
      const outer = { child: inner };
      inner.parent = outer;
      const copy = el._deepCopy(outer);
      expect(copy.child.val).to.equal(10);
      expect(copy.child.parent).to.be.undefined;
    });
  });

  // ------------------------------------------------------------------
  // _getValidity
  // ------------------------------------------------------------------
  suite('_getValidity', () => {
    test('returns true when not required', async () => {
      const el = await newTable();
      el.required = false;
      el.items = [];
      expect(el._getValidity()).to.be.true;
    });

    test('returns true when required and items has entries', async () => {
      const el = await newTable();
      el.required = true;
      el.items = [{ id: 1 }];
      expect(el._getValidity()).to.be.true;
    });

    test('returns false when required and items is empty', async () => {
      const el = await newTable();
      el.required = true;
      el.items = [];
      expect(el._getValidity()).to.be.false;
    });

    test('returns false when required and items is null', async () => {
      const el = await newTable();
      el.required = true;
      el.items = null;
      expect(el._getValidity()).to.not.be.ok;
    });

    // WEBUI-482 / WEBUI-180: a required multivalued complex property that is left empty must say so,
    // and say it where assistive technologies can find it, not with a coloured label alone.
    test('conveys an empty required table as text and as state on the table', async () => {
      const el = await newTable();
      el.label = 'Contributors';
      el.required = true;
      el.items = [];

      expect(el.validate()).to.be.false;
      await new Promise((resolve) => setTimeout(resolve, 20));

      const error = el.shadowRoot.querySelector('.error');
      expect(el.errorMessage).to.be.ok;
      expect(error.textContent.trim()).to.equal(el.errorMessage);
      expect(el.$.table.getAttribute('aria-required')).to.equal('true');
      expect(el.$.table.getAttribute('aria-invalid')).to.equal('true');
      expect(el.$.table.getAttribute('aria-describedby')).to.equal(error.id);

      el.items = [{ id: 1 }];
      expect(el.validate()).to.be.true;
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(el.errorMessage).to.equal('');
      expect(el.$.table.getAttribute('aria-invalid')).to.equal('false');
      expect(el.$.table.hasAttribute('aria-describedby')).to.be.false;
    });
  });

  // ------------------------------------------------------------------
  // _moveItemUpward / _moveItemDownward
  // ------------------------------------------------------------------
  suite('_moveItemUpward', () => {
    test('moves item up by one position', async () => {
      const el = await newTable();
      el.items = ['a', 'b', 'c'];
      const e = { stopPropagation: sinon.spy(), detail: { index: 1 } };

      el._moveItemUpward(e);

      expect(el.items).to.deep.equal(['b', 'a', 'c']);
      expect(e.stopPropagation).to.have.been.called;
    });

    test('does nothing when index is 0 (boundary)', async () => {
      const el = await newTable();
      el.items = ['a', 'b', 'c'];
      const e = { stopPropagation: sinon.spy(), detail: { index: 0 } };

      el._moveItemUpward(e);

      expect(el.items).to.deep.equal(['a', 'b', 'c']);
    });
  });

  suite('_moveItemDownward', () => {
    test('moves item down by one position', async () => {
      const el = await newTable();
      el.items = ['a', 'b', 'c'];
      const e = { stopPropagation: sinon.spy(), detail: { index: 1 } };

      el._moveItemDownward(e);

      expect(el.items).to.deep.equal(['a', 'c', 'b']);
      expect(e.stopPropagation).to.have.been.called;
    });

    test('does nothing when index is at last position (boundary)', async () => {
      const el = await newTable();
      el.items = ['a', 'b', 'c'];
      const e = { stopPropagation: sinon.spy(), detail: { index: 2 } };

      el._moveItemDownward(e);

      expect(el.items).to.deep.equal(['a', 'b', 'c']);
    });
  });

  // ------------------------------------------------------------------
  // _isFocusable
  // ------------------------------------------------------------------
  suite('_isFocusable', () => {
    test('returns true when target is an anchor element', async () => {
      const el = await newTable();
      const anchor = document.createElement('a');
      expect(el._isFocusable(anchor)).to.be.true;
    });

    test('returns true when target is a DataTableCheckbox', async () => {
      const el = await newTable();
      const checkbox = document.createElement('nuxeo-data-table-checkbox');
      expect(el._isFocusable(checkbox)).to.be.true;
    });

    test('returns false for a generic div not containing activeElement', async () => {
      const el = await newTable();
      const div = document.createElement('div');
      document.body.appendChild(div);
      expect(el._isFocusable(div)).to.be.false;
      document.body.removeChild(div);
    });
  });

  // ------------------------------------------------------------------
  // _onCheckBoxKeydown
  // ------------------------------------------------------------------
  suite('_onCheckBoxKeydown', () => {
    test('prevents default and stops propagation for Enter key', async () => {
      const el = await newTable();
      const e = {
        key: 'Enter',
        code: 'Enter',
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };

      el._onCheckBoxKeydown(e);

      expect(e.preventDefault).to.have.been.called;
      expect(e.stopPropagation).to.have.been.called;
    });

    test('prevents default and stops propagation for Space key', async () => {
      const el = await newTable();
      const e = {
        key: ' ',
        code: 'Space',
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };

      el._onCheckBoxKeydown(e);

      expect(e.preventDefault).to.have.been.called;
      expect(e.stopPropagation).to.have.been.called;
    });

    test('does nothing for other keys', async () => {
      const el = await newTable();
      const e = {
        key: 'Tab',
        code: 'Tab',
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };

      el._onCheckBoxKeydown(e);

      expect(e.preventDefault).to.not.have.been.called;
      expect(e.stopPropagation).to.not.have.been.called;
    });

    test('handles code-only match (key is empty)', async () => {
      const el = await newTable();
      const e = {
        key: '',
        code: 'Space',
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };

      el._onCheckBoxKeydown(e);

      expect(e.preventDefault).to.have.been.called;
    });
  });

  // ------------------------------------------------------------------
  // _onCheckBoxTap
  // ------------------------------------------------------------------
  suite('_onCheckBoxTap', () => {
    test('dispatches selected event when selectionEnabled', async () => {
      const el = await newTable();
      el.selectionEnabled = true;
      el.selectOnTap = false;
      sinon.stub(el, '_updateFlags');

      const target = document.createElement('div');
      let firedEvent = null;
      target.addEventListener('selected', (ev) => {
        firedEvent = ev;
      });

      el._onCheckBoxTap({
        target,
        model: { index: 3 },
        shiftKey: false,
      });

      expect(firedEvent).to.not.be.null;
      expect(firedEvent.detail.index).to.equal(3);
      el._updateFlags.restore();
    });

    test('toggles selection when selectOnTap is true', async () => {
      const el = await newTable();
      el.selectionEnabled = true;
      el.selectOnTap = true;
      const toggleStub = sinon.stub(el.$.list, 'toggleSelectionForIndex');
      sinon.stub(el, '_updateFlags');

      el._onCheckBoxTap({
        target: document.createElement('div'),
        model: { index: 2 },
        shiftKey: false,
      });

      expect(toggleStub).to.have.been.calledWith(2);
      toggleStub.restore();
      el._updateFlags.restore();
    });

    test('does nothing when selectionEnabled is false', async () => {
      const el = await newTable();
      el.selectionEnabled = false;
      const updateSpy = sinon.spy(el, '_updateFlags');

      el._onCheckBoxTap({
        target: document.createElement('div'),
        model: { index: 0 },
        shiftKey: false,
      });

      expect(updateSpy).to.not.have.been.called;
      updateSpy.restore();
    });
  });

  // ------------------------------------------------------------------
  // _isComplexEntry
  // ------------------------------------------------------------------
  suite('_isComplexEntry', () => {
    function formWith(markup) {
      const template = document.createElement('template');
      template.innerHTML = markup;
      return { queryEffectiveChildren: () => template };
    }

    // Mirrors what a form looks like once Polymer has parsed and stamped its template: the markup
    // has been moved out and the binding annotations survive only in the parsed template info.
    function stampedFormWith(...sources) {
      const template = document.createElement('template');
      const parts = sources.map((source) => {
        return { source };
      });
      template._templateInfo = { nodeInfoList: [{ bindings: [{ target: 'value', parts }] }] };
      return { queryEffectiveChildren: () => template };
    }

    test('treats sub-property bindings as complex entries', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Address' }];

      expect(el._isComplexEntry(formWith('<nuxeo-input value="{{item.address}}"></nuxeo-input>'))).to.be.true;
    });

    test('treats whole-value bindings as primitive entries', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Value' }];

      expect(el._isComplexEntry(formWith('<nuxeo-input value="{{item}}"></nuxeo-input>'))).to.be.false;
    });

    test('treats event-annotated whole-value bindings as primitive entries', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Value' }];

      expect(el._isComplexEntry(formWith('<input value="{{item::input}}">'))).to.be.false;
    });

    // Covers the raw-markup path only. The parsed-template equivalent is asserted further down
    // against a real stamped form, where `source` is the whole expression rather than a path.
    test('detects sub-properties inside computed bindings in unparsed markup', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Date' }];

      expect(el._isComplexEntry(formWith('<span>[[formatDate(item.date)]]</span>'))).to.be.true;
    });

    test('does not mistake an "items" reference for a sub-property', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Value' }];

      expect(el._isComplexEntry(formWith('<span>[[items.length]]</span><input value="{{item}}">'))).to.be.false;
    });

    test('falls back to the shape of existing entries when no template is available', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Only' }];

      el.items = [{ address: 'a' }];
      expect(el._isComplexEntry(null)).to.be.true;

      el.items = ['a'];
      expect(el._isComplexEntry(null)).to.be.false;
    });

    test('skips null and undefined entries when sampling existing entries', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Only' }];
      el.items = [null, undefined, { address: 'a' }];

      expect(el._isComplexEntry(null)).to.be.true;
    });

    test('falls back to column count for an empty list with no template', async () => {
      const el = await newTable();
      el.items = [];

      el.columns = [{ name: 'Only' }];
      expect(el._isComplexEntry(null)).to.be.false;

      el.columns = [{ name: 'A' }, { name: 'B' }];
      expect(el._isComplexEntry(null)).to.be.true;
    });

    test('reads the entry shape from a stamped template whose markup is gone', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Address' }];
      el.items = [];

      expect(el._isComplexEntry(stampedFormWith('item.address'))).to.be.true;
    });

    test('reads primitive entries from a stamped template whose markup is gone', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Value' }];
      el.items = [];

      expect(el._isComplexEntry(stampedFormWith('item'))).to.be.false;
    });

    test('reads the entry shape from a template parsed by the templatizer', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Address' }];
      el.items = [];

      const template = document.createElement('template');
      template.__templateInfo = {
        nodeInfoList: [{ bindings: [{ target: 'value', parts: [{ source: 'item.address' }] }] }],
      };

      expect(el._isComplexEntry({ queryEffectiveChildren: () => template })).to.be.true;
    });

    test('ignores binding parts that carry no property path', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Only' }];
      el.items = [{ address: 'a' }];

      expect(el._isComplexEntry(stampedFormWith(undefined))).to.be.true;
    });

    test('ignores host-prop parts that only forward the entry to a nested template', async () => {
      const el = await newTable();
      el.columns = [{ name: 'Address' }];
      el.items = [];

      // The shape Polymer produces for `<template is="dom-if">`: a host-prop part on the outer node
      // naming `item`, with the real binding held in that node's nested template info.
      const template = document.createElement('template');
      template._templateInfo = {
        nodeInfoList: [
          {
            bindings: [{ target: '_host_item', parts: [{ source: 'item', hostProp: true }] }],
            templateInfo: {
              nodeInfoList: [{ bindings: [{ target: 'value', parts: [{ source: 'item.address' }] }] }],
            },
          },
        ],
      };

      expect(el._isComplexEntry({ queryEffectiveChildren: () => template })).to.be.true;
    });

    test('falls back safely when columns is explicitly null', async () => {
      const el = await newTable();
      el.columns = null;
      el.items = [];

      expect(() => el._isComplexEntry(null)).to.not.throw();
      expect(el._isComplexEntry(null)).to.be.false;
    });

    // The suites above pin behaviour against hand-built template info. These mount a real
    // <nuxeo-data-table-form> so Polymer itself parses and stamps the template, which is what
    // guarantees the assumed shape actually matches the one in production.
    suite('against templates parsed by Polymer', () => {
      const mounted = [];

      async function parsedForm(markup) {
        const form = document.createElement('nuxeo-data-table-form');
        const template = document.createElement('template');
        template.innerHTML = markup;
        form.appendChild(template);
        document.body.appendChild(form);
        mounted.push(form);
        await flush();
        return form;
      }

      teardown(() => {
        while (mounted.length) {
          mounted.pop().remove();
        }
      });

      test('reads the entry shape once Polymer has consumed the markup', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Address' }];
        el.items = [];

        const form = await parsedForm('<input value="{{item.address}}">');
        const template = form.queryEffectiveChildren('template');

        // Parsing strips the annotation, so the markup regex cannot be what answers this.
        expect(template.innerHTML).to.not.contain('item.address');
        expect(el._isComplexEntry(form)).to.be.true;
      });

      test('reads primitive entries once Polymer has consumed the markup', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Value' }];
        el.items = [];

        expect(el._isComplexEntry(await parsedForm('<input value="{{item}}">'))).to.be.false;
      });

      test('detects sub-properties bound inside a dom-if', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Address' }];
        el.items = [];

        const form = await parsedForm(
          '<template is="dom-if" if="[[show]]"><input value="{{item.address}}"></template>',
        );

        expect(el._isComplexEntry(form)).to.be.true;
      });

      test('detects a multi-column complex form wrapped in a dom-if', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Address' }, { name: 'City' }];
        el.items = [];

        const form = await parsedForm(
          '<template is="dom-if" if="[[show]]"><input value="{{item.address}}"><input value="{{item.city}}"></template>',
        );

        expect(el._isComplexEntry(form)).to.be.true;
      });

      test('treats a dom-if around a whole-value binding as a primitive entry', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Value' }];
        el.items = [];

        const form = await parsedForm('<template is="dom-if" if="[[show]]"><input value="{{item}}"></template>');

        expect(el._isComplexEntry(form)).to.be.false;
      });

      test('detects sub-properties reached only through a computed binding', async () => {
        const el = await newTable();
        el.columns = [{ name: 'Date' }];
        el.items = [];

        expect(el._isComplexEntry(await parsedForm('<span>[[formatDate(item.date)]]</span>'))).to.be.true;
      });
    });
  });

  // ------------------------------------------------------------------
  // _toggleEditDialog
  // ------------------------------------------------------------------
  suite('_toggleEditDialog', () => {
    function makeMockForm(el, markup) {
      const form = { index: -1, item: null };
      if (typeof markup === 'string') {
        const template = document.createElement('template');
        template.innerHTML = markup;
        form.queryEffectiveChildren = () => template;
      }
      sinon.stub(el, 'getContentChildren').returns([form]);
      sinon.stub(el.$.dialog, 'toggle');
      return form;
    }

    test('sets form index and copies item when itemIndex is provided', async () => {
      const el = await newTable();
      el.items = [{ a: 1 }, { b: 2 }];
      const form = makeMockForm(el);

      el._toggleEditDialog(1);

      expect(form.index).to.equal(1);
      expect(form.item).to.deep.equal({ b: 2 });
      expect(form.item).to.not.equal(el.items[1]);
      expect(el.$.dialog.toggle).to.have.been.called;
    });

    test('sets form to empty object for new entry (multiple columns, object items)', async () => {
      const el = await newTable();
      el.items = [{ a: 1 }, { b: 2 }];
      el.columns = [{ name: 'A' }, { name: 'B' }];
      const form = makeMockForm(el);

      el._toggleEditDialog();

      expect(form.index).to.equal(-1);
      expect(form.item).to.deep.equal({});
    });

    test('sets form to empty string for primitives (>1 items, non-object)', async () => {
      const el = await newTable();
      el.items = ['one', 'two'];
      el.columns = [{ name: 'Value' }];
      const form = makeMockForm(el);

      el._toggleEditDialog();

      expect(form.index).to.equal(-1);
      expect(form.item).to.equal('');
    });

    test('sets form to empty object when a single column holds complex items', async () => {
      const el = await newTable();
      el.items = [{ a: 1 }, { b: 2 }];
      el.columns = [{ name: 'Only' }];
      const form = makeMockForm(el);

      el._toggleEditDialog();

      expect(form.index).to.equal(-1);
      expect(form.item).to.deep.equal({});
    });

    test('sets form to empty object for an empty single-column complex field', async () => {
      const el = await newTable();
      el.items = [];
      el.columns = [{ name: 'Address' }];
      const form = makeMockForm(el, '<nuxeo-input value="{{item.address}}" name="address"></nuxeo-input>');

      el._toggleEditDialog();

      expect(form.index).to.equal(-1);
      expect(form.item).to.deep.equal({});
    });

    test('sets form to empty string for an empty single-column primitive field', async () => {
      const el = await newTable();
      el.items = [];
      el.columns = [{ name: 'Multi String' }];
      const form = makeMockForm(el, '<nuxeo-input value="{{item}}" name="string"></nuxeo-input>');

      el._toggleEditDialog();

      expect(form.index).to.equal(-1);
      expect(form.item).to.equal('');
    });

    // WEBUI-1443: a complex type with a single subfield renders one column, exactly like a list of
    // primitives. Once the form has been stamped its markup is empty, so the shape has to come from
    // the parsed binding info, otherwise the entry is seeded as '' and the typed value is dropped.
    test('seeds an object for a stamped single-column complex form', async () => {
      const el = await newTable();
      el.items = [];
      el.columns = [{ name: 'Address' }];

      const template = document.createElement('template');
      template._templateInfo = {
        nodeInfoList: [{ bindings: [{ target: 'value', parts: [{ source: 'item.address' }] }] }],
      };
      const form = { index: -1, item: null, queryEffectiveChildren: () => template };
      sinon.stub(el, 'getContentChildren').returns([form]);
      sinon.stub(el.$.dialog, 'toggle');

      el._toggleEditDialog();

      expect(template.innerHTML).to.equal('');
      expect(form.item).to.deep.equal({});
    });

    test('handles index 0 as a valid itemIndex', async () => {
      const el = await newTable();
      el.items = [{ first: true }];
      const form = makeMockForm(el);

      el._toggleEditDialog(0);

      expect(form.index).to.equal(0);
      expect(form.item).to.deep.equal({ first: true });
    });
  });

  // ------------------------------------------------------------------
  // _formDialogOpenedChanged
  // ------------------------------------------------------------------
  suite('_formDialogOpenedChanged', () => {
    test('enables form when dialog opens', async () => {
      const el = await newTable();
      const form = { disabled: true };
      sinon.stub(el, 'getContentChildren').returns([form]);

      el._formDialogOpenedChanged({ detail: { value: true } });

      expect(form.disabled).to.be.false;
    });

    test('disables form when dialog closes', async () => {
      const el = await newTable();
      const form = { disabled: false };
      sinon.stub(el, 'getContentChildren').returns([form]);

      el._formDialogOpenedChanged({ detail: { value: false } });

      expect(form.disabled).to.be.true;
    });

    test('handles missing form gracefully', async () => {
      const el = await newTable();
      sinon.stub(el, 'getContentChildren').returns([]);

      expect(() => el._formDialogOpenedChanged({ detail: { value: true } })).to.not.throw();
    });
  });

  // ------------------------------------------------------------------
  // get settings / set settings
  // ------------------------------------------------------------------
  suite('get settings', () => {
    test('returns column state keyed by field', async () => {
      const el = await newTable();
      el.columns = [
        { field: 'dc:title', hidden: false, order: 0, width: '200px', resized: true },
        { field: 'dc:modified', hidden: true, order: 1, width: null, resized: false },
      ];
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];

      const s = el.settings;

      expect(s.columns['dc:title']).to.deep.equal({ hidden: false, order: 0, width: '200px', resized: true });
      expect(s.columns['dc:modified']).to.deep.equal({ hidden: true, order: 1, width: null, resized: false });
      expect(s.sortOrder).to.deep.equal([{ path: 'dc:title', direction: 'asc' }]);
    });

    test('falls back to col-N key when field is missing', async () => {
      const el = await newTable();
      el.columns = [{ hidden: false, order: 0, width: null }];
      el.sortOrder = null;

      const s = el.settings;

      expect(s.columns).to.have.property('col-0');
    });

    test('uses index as order when column.order is not a number', async () => {
      const el = await newTable();
      el.columns = [{ field: 'x', hidden: false, order: undefined, width: null }];
      el.sortOrder = [];

      const s = el.settings;
      expect(s.columns.x.order).to.equal(0);
    });

    test('handles sortOrder as non-array', async () => {
      const el = await newTable();
      el.columns = [];
      el.sortOrder = { path: 'dc:title', direction: 'asc' };

      const s = el.settings;
      expect(s.sortOrder).to.deep.equal({ path: 'dc:title', direction: 'asc' });
    });

    test('handles null sortOrder', async () => {
      const el = await newTable();
      el.columns = [];
      el.sortOrder = null;

      const s = el.settings;
      expect(s.sortOrder).to.be.null;
    });

    test('handles undefined sortOrder', async () => {
      const el = await newTable();
      el.columns = [];
      el.sortOrder = undefined;

      const s = el.settings;
      expect(s.sortOrder).to.be.null;
    });

    test('persists filterValue when set (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false, order: 0, width: null, filterValue: 'hello' }];
      el.sortOrder = [];

      const s = el.settings;
      expect(s.columns['dc:title'].filterValue).to.equal('hello');
    });

    test('does not persist filterValue when empty/unset (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [
        { field: 'dc:title', hidden: false, order: 0, width: null, filterValue: '' },
        { field: 'dc:modified', hidden: false, order: 1, width: null },
      ];
      el.sortOrder = [];

      const s = el.settings;
      expect(s.columns['dc:title']).to.not.have.property('filterValue');
      expect(s.columns['dc:modified']).to.not.have.property('filterValue');
    });

    test('persists filterExpression when set (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [
        {
          field: 'dc:title',
          hidden: false,
          order: 0,
          width: null,
          filterValue: 'hello',
          filterExpression: '%$term%',
        },
      ];
      el.sortOrder = [];

      const s = el.settings;
      expect(s.columns['dc:title'].filterExpression).to.equal('%$term%');
    });

    test('does not persist filterExpression when unset (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false, order: 0, width: null, filterValue: 'hello' }];
      el.sortOrder = [];

      const s = el.settings;
      expect(s.columns['dc:title']).to.not.have.property('filterExpression');
    });
  });

  suite('set settings', () => {
    test('does nothing when settings is null', async () => {
      const el = await newTable();
      const setSpy = sinon.spy(el, 'set');

      el.settings = null;

      expect(setSpy).to.not.have.been.called;
      setSpy.restore();
    });

    test('applies column hidden state', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: true } } };

      expect(setSpy).to.have.been.calledWith('columns.0.hidden', true);
      setSpy.restore();
    });

    test('applies column order when provided', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false, order: 5 } } };

      expect(setSpy).to.have.been.calledWith('columns.0.order', 5);
      setSpy.restore();
    });

    test('applies column width and resized flag', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false, width: '300px', resized: true } } };

      expect(setSpy).to.have.been.calledWith('columns.0.width', '300px');
      expect(setSpy).to.have.been.calledWith('columns.0.resized', true);
      setSpy.restore();
    });

    test('defaults resized to true when width is present but resized is not', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false, width: '200px' } } };

      expect(setSpy).to.have.been.calledWith('columns.0.resized', true);
      setSpy.restore();
    });

    test('applies sortOrder from top-level settings', async () => {
      const el = await newTable();
      el.columns = [];

      el.settings = { sortOrder: [{ path: 'dc:title', direction: 'asc' }] };

      expect(el.sortOrder).to.deep.equal([{ path: 'dc:title', direction: 'asc' }]);
    });

    test('applies sortOrder from settings.columns (backward compat)', async () => {
      const el = await newTable();
      el.columns = [];

      el.settings = { columns: { sortOrder: [{ path: 'dc:modified', direction: 'desc' }] } };

      expect(el.sortOrder).to.deep.equal([{ path: 'dc:modified', direction: 'desc' }]);
    });

    test('defaults non-array sortOrder to empty array', async () => {
      const el = await newTable();
      el.columns = [];

      el.settings = { sortOrder: 'invalid' };

      expect(el.sortOrder).to.deep.equal([]);
    });

    test('syncs sort with page provider when available', async () => {
      const el = await newTable();
      el.columns = [];
      const provider = document.createElement('div');
      provider.sort = {};
      provider.auto = true;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'notifyResize');

      el.settings = { sortOrder: [{ path: 'dc:title', direction: 'asc' }] };

      expect(el.nxProvider.sort).to.deep.equal({ 'dc:title': 'asc' });
      el.notifyResize.restore();
    });

    test('calls fetch when provider is not auto', async () => {
      const el = await newTable();
      el.columns = [];
      const provider = document.createElement('div');
      provider.sort = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { sortOrder: [{ path: 'dc:title', direction: 'asc' }] };

      expect(fetchStub).to.have.been.called;
      fetchStub.restore();
      el.notifyResize.restore();
    });

    test('falls back to col-N key when field is missing on column', async () => {
      const el = await newTable();
      el.columns = [{ hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'col-0': { hidden: true } } };

      expect(setSpy).to.have.been.calledWith('columns.0.hidden', true);
      setSpy.restore();
    });

    // ------------------------------------------------------------------
    // filter restore (WEBUI-1885)
    // ------------------------------------------------------------------
    test('restores filterValue from saved settings', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'hello' } } };

      expect(setSpy).to.have.been.calledWith('columns.0.filterValue', 'hello');
      setSpy.restore();
    });

    test('does not restore filterValue when missing from saved settings', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false } } };

      const filterValueCalls = setSpy
        .getCalls()
        .filter((c) => typeof c.args[0] === 'string' && c.args[0].endsWith('.filterValue'));
      expect(filterValueCalls).to.have.lengthOf(0);
      setSpy.restore();
    });

    test('does not restore filterValue when persisted value is empty/falsy', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const setSpy = sinon.spy(el, 'set');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: '' } } };

      const filterValueCalls = setSpy
        .getCalls()
        .filter((c) => typeof c.args[0] === 'string' && c.args[0].endsWith('.filterValue'));
      expect(filterValueCalls).to.have.lengthOf(0);
      setSpy.restore();
    });

    test('toggles _suppressFilterEvents around the restore loop', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', hidden: false }];
      const observed = [];
      const origSet = el.set.bind(el);
      sinon.stub(el, 'set').callsFake((path, value) => {
        if (typeof path === 'string' && path.endsWith('.filterValue')) {
          observed.push(el._suppressFilterEvents);
        }
        return origSet(path, value);
      });

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'hello' } } };

      // While the per-column set was happening, suppression must have been true
      expect(observed.every((v) => v === true)).to.be.true;
      // After restore, it must be reset to false
      expect(el._suppressFilterEvents).to.be.false;
      el.set.restore();
    });

    test('applies restored filters to nxProvider.params and this.filters then fetches once', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false, name: 'Title' }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'hello' } } };

      expect(provider.params['dc:title']).to.equal('hello');
      expect(el.filters).to.have.lengthOf(1);
      expect(el.filters[0]).to.include({ path: 'dc:title', value: 'hello', name: 'Title' });
      expect(fetchStub).to.have.been.calledOnce;

      fetchStub.restore();
      el.notifyResize.restore();
    });

    test('substitutes $term in filterExpression when restoring', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = {
        columns: { 'dc:title': { hidden: false, filterValue: 'hello', filterExpression: '%$term%' } },
      };

      expect(provider.params['dc:title']).to.equal('%hello%');
      expect(el.filters[0].expression).to.equal('%$term%');

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('restores filterExpression onto the column object (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = {
        columns: { 'dc:title': { hidden: false, filterValue: 'hello', filterExpression: '%$term%' } },
      };

      expect(el.columns[0].filterExpression).to.equal('%$term%');

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('does not set filterExpression on column when absent from saved settings (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'hello' } } };

      expect(el.columns[0].filterExpression).to.be.undefined;

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('updates existing entry in this.filters instead of pushing a duplicate', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [{ path: 'dc:title', value: 'old', name: 'Title' }];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'new' } } };

      expect(el.filters).to.have.lengthOf(1);
      expect(el.filters[0].value).to.equal('new');

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('updates expression and name on existing filter entry (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', name: 'Title', hidden: false }];
      el.filters = [{ path: 'dc:title', value: 'old', name: 'Stale Name', expression: 'stale' }];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = {
        columns: { 'dc:title': { hidden: false, filterValue: 'new', filterExpression: '%$term%' } },
      };

      expect(el.filters).to.have.lengthOf(1);
      expect(el.filters[0].value).to.equal('new');
      expect(el.filters[0].expression).to.equal('%$term%');
      expect(el.filters[0].name).to.equal('Title');

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('treats $ in user filter value literally when applying filterExpression (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      // $1 in the search term must not be treated as a back-reference
      el.settings = {
        columns: { 'dc:title': { hidden: false, filterValue: '$1 test', filterExpression: '%$term%' } },
      };

      expect(provider.params['dc:title']).to.equal('%$1 test%');

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('resets nxProvider.page to 1 when paginable', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      el.paginable = true;
      const provider = document.createElement('div');
      provider.params = {};
      provider.page = 5;
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { columns: { 'dc:title': { hidden: false, filterValue: 'hello' } } };

      expect(provider.page).to.equal(1);

      el.fetch.restore();
      el.notifyResize.restore();
    });

    test('does not fetch when no filters were restored', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { columns: { 'dc:title': { hidden: true } } };

      expect(fetchStub).to.not.have.been.called;

      fetchStub.restore();
      el.notifyResize.restore();
    });

    test('fetches only once when both filters and sortOrder are restored (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [{ field: 'dc:title', filterBy: 'dc:title', hidden: false }];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = {
        columns: { 'dc:title': { hidden: false, filterValue: 'hello' } },
        sortOrder: [{ path: 'dc:title', direction: 'asc' }],
      };

      expect(fetchStub).to.have.been.calledOnce;

      fetchStub.restore();
      el.notifyResize.restore();
    });

    test('fetches when only sortOrder is restored and nxProvider.auto is false (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = false;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { sortOrder: [{ path: 'dc:title', direction: 'asc' }] };

      expect(fetchStub).to.have.been.calledOnce;

      fetchStub.restore();
      el.notifyResize.restore();
    });

    test('does not fetch when only sortOrder is restored and nxProvider.auto is true (ELEMENTS-1966)', async () => {
      const el = await newTable();
      el.columns = [];
      el.filters = [];
      const provider = document.createElement('div');
      provider.params = {};
      provider.auto = true;
      sinon.stub(el, '_nxProviderChanged');
      el.nxProvider = provider;
      sinon.stub(el, '_hasPageProvider').returns(true);
      const fetchStub = sinon.stub(el, 'fetch');
      sinon.stub(el, 'notifyResize');

      el.settings = { sortOrder: [{ path: 'dc:title', direction: 'asc' }] };

      expect(fetchStub).to.not.have.been.called;

      fetchStub.restore();
      el.notifyResize.restore();
    });
  });

  // ------------------------------------------------------------------
  // _fireSettingsChanged
  // ------------------------------------------------------------------
  suite('_fireSettingsChanged', () => {
    test('dispatches settings-changed event with detail', async () => {
      const el = await newTable();
      let capturedDetail = null;
      el.addEventListener('settings-changed', (e) => {
        capturedDetail = e.detail;
      });

      el._fireSettingsChanged({ source: 'column-resize', column: 'dc:title' });

      expect(capturedDetail).to.deep.equal({ source: 'column-resize', column: 'dc:title' });
    });

    test('dispatches with empty detail by default', async () => {
      const el = await newTable();
      let capturedDetail = null;
      el.addEventListener('settings-changed', (e) => {
        capturedDetail = e.detail;
      });

      el._fireSettingsChanged();

      expect(capturedDetail).to.deep.equal({});
    });
  });

  // ------------------------------------------------------------------
  // Column resize methods
  // ------------------------------------------------------------------
  suite('_onColumnResizeStart', () => {
    test('does nothing when columnResizeEnabled is false', async () => {
      const el = await newTable();
      el.columnResizeEnabled = false;
      el._resizing = null;

      el._onColumnResizeStart({ detail: { column: {}, startX: 100, startWidth: 200 } });

      expect(el._resizing).to.be.null;
    });

    test('does nothing when detail is missing column or startX', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;

      el._onColumnResizeStart({ detail: { startX: 100 } });
      expect(el._resizing).to.be.null;

      el._onColumnResizeStart({ detail: { column: {} } });
      expect(el._resizing).to.be.null;
    });

    test('initializes resize state when enabled', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      sinon.stub(el, '_resizeCellContainers');
      const col = { name: 'title' };

      el._onColumnResizeStart({ detail: { column: col, startX: 50, startWidth: 150 } });

      expect(el._resizing).to.not.be.null;
      expect(el._resizing.column).to.equal(col);
      expect(el._resizing.startWidth).to.equal(150);
      el._resizeCellContainers.restore();
    });
  });

  suite('_documentMouseMove', () => {
    test('does nothing when not resizing', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      el._resizing = null;

      expect(() => el._documentMouseMove({ clientX: 100 })).to.not.throw();
    });

    test('does nothing when resize is disabled', async () => {
      const el = await newTable();
      el.columnResizeEnabled = false;
      el._resizing = { column: {}, startX: 0, startWidth: 100 };

      expect(() => el._documentMouseMove({ clientX: 100 })).to.not.throw();
    });

    test('updates column width from mouse movement', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test' };
      el.columns = [col];
      el._resizing = { column: col, startX: 100, startWidth: 200 };
      sinon.stub(el, '_resizeCellContainers');
      const setSpy = sinon.spy(el, 'set');

      el._documentMouseMove({ clientX: 120 });

      const widthCall = setSpy.getCalls().find((c) => c.args[0] === 'columns.0.width');
      expect(widthCall).to.exist;
      const resizedCall = setSpy.getCalls().find((c) => c.args[0] === 'columns.0.resized');
      expect(resizedCall).to.exist;
      expect(resizedCall.args[1]).to.be.true;
      setSpy.restore();
      el._resizeCellContainers.restore();
    });

    test('enforces minimum width', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test' };
      el.columns = [col];
      el._resizing = { column: col, startX: 100, startWidth: 200 };
      sinon.stub(el, '_resizeCellContainers');
      const setSpy = sinon.spy(el, 'set');

      el._documentMouseMove({ clientX: -500 });

      const widthCall = setSpy.getCalls().find((c) => c.args[0] === 'columns.0.width');
      expect(widthCall).to.exist;
      expect(parseInt(widthCall.args[1], 10)).to.be.at.least(10);
      setSpy.restore();
      el._resizeCellContainers.restore();
    });

    test('uses column minWidth when set', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test', minWidth: '50' };
      el.columns = [col];
      el._resizing = { column: col, startX: 100, startWidth: 200 };
      sinon.stub(el, '_resizeCellContainers');
      const setSpy = sinon.spy(el, 'set');

      el._documentMouseMove({ clientX: -500 });

      const widthCall = setSpy.getCalls().find((c) => c.args[0] === 'columns.0.width');
      expect(parseInt(widthCall.args[1], 10)).to.be.at.least(50);
      setSpy.restore();
      el._resizeCellContainers.restore();
    });

    test('handles touch events', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test' };
      el.columns = [col];
      el._resizing = { column: col, startX: 100, startWidth: 200 };
      sinon.stub(el, '_resizeCellContainers');
      const setSpy = sinon.spy(el, 'set');
      const preventDefaultSpy = sinon.spy();

      el._documentMouseMove({
        touches: [{ clientX: 120 }],
        preventDefault: preventDefaultSpy,
      });

      expect(preventDefaultSpy).to.have.been.called;
      const widthCall = setSpy.getCalls().find((c) => c.args[0] === 'columns.0.width');
      expect(widthCall).to.exist;
      setSpy.restore();
      el._resizeCellContainers.restore();
    });
  });

  suite('_documentMouseUp', () => {
    test('does nothing when not resizing', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      el._resizing = null;

      expect(() => el._documentMouseUp()).to.not.throw();
    });

    test('does nothing when resize is disabled', async () => {
      const el = await newTable();
      el.columnResizeEnabled = false;
      el._resizing = { column: {} };

      expect(() => el._documentMouseUp()).to.not.throw();
    });

    test('clears resize state and fires settings-changed', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test' };
      el._resizing = { column: col };
      sinon.stub(el, '_getHeaderCells').returns([]);
      sinon.stub(el, 'notifyResize');
      const fireStub = sinon.spy(el, '_fireSettingsChanged');

      el._documentMouseUp();

      expect(el._resizing).to.be.null;
      expect(fireStub).to.have.been.calledOnce;
      expect(fireStub.firstCall.args[0]).to.have.property('source', 'column-resize');
      fireStub.restore();
      el.notifyResize.restore();
    });

    test('clears resizing class from matching header cell', async () => {
      const el = await newTable();
      el.columnResizeEnabled = true;
      const col = { name: 'test' };
      el.columnReorderEnabled = true;
      const mockCell = {
        column: col,
        classList: { remove: sinon.spy() },
        style: {},
        draggable: false,
      };
      el._resizing = { column: col };
      sinon.stub(el, '_getHeaderCells').returns([mockCell]);
      sinon.stub(el, 'notifyResize');
      sinon.stub(el, '_fireSettingsChanged');

      el._documentMouseUp();

      expect(mockCell.classList.remove).to.have.been.calledWith('resizing');
      expect(mockCell.draggable).to.be.true;
      el.notifyResize.restore();
    });
  });

  // ------------------------------------------------------------------
  // Column reorder methods
  // ------------------------------------------------------------------
  suite('_onColumnDragStart', () => {
    test('does nothing when reorder is disabled', async () => {
      const el = await newTable();
      el.columnReorderEnabled = false;

      el._onColumnDragStart({ detail: { column: {} } });

      expect(el._reorderingColumns).to.be.false;
    });

    test('initializes drag state when enabled', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      const col = { name: 'A', order: 0, hidden: false };
      el.columns = [col];
      sinon.stub(el, '_markActiveColumn');
      sinon.stub(el, 'getBoundingClientRect').returns({ left: 10 });
      const mockCell = {
        column: col,
        getBoundingClientRect: () => {
          return { left: 10, right: 110 };
        },
      };
      sinon.stub(el, '_getHeaderCells').returns([mockCell]);

      el._onColumnDragStart({ detail: { column: col } });

      expect(el._reorderingColumns).to.be.true;
      expect(el._draggingColumn).to.equal(col);
      expect(el._dragHeaderLeft).to.equal(10);
      el._markActiveColumn.restore();
    });
  });

  suite('_onColumnDragEnd', () => {
    test('does nothing when reorder is disabled', async () => {
      const el = await newTable();
      el.columnReorderEnabled = false;

      el._onColumnDragEnd();

      expect(el._reorderingColumns).to.be.false;
    });

    test('resets state when no valid drag/drop pair', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._reorderingColumns = true;
      el._draggingColumn = null;
      el._dragOverColumn = null;
      sinon.stub(el, '_resetDragState');

      el._onColumnDragEnd();

      expect(el._resetDragState).to.have.been.called;
      el._resetDragState.restore();
    });

    test('resets state when dragging column equals drop target', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._reorderingColumns = true;
      const col = { order: 0 };
      el._draggingColumn = col;
      el._dragOverColumn = col;
      sinon.stub(el, '_resetDragState');

      el._onColumnDragEnd();

      expect(el._resetDragState).to.have.been.called;
      el._resetDragState.restore();
    });

    test('reorders columns and fires settings-changed', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._reorderingColumns = true;
      const colA = { name: 'A', order: 0 };
      const colB = { name: 'B', order: 1 };
      const colC = { name: 'C', order: 2 };
      el.columns = [colA, colB, colC];
      el._draggingColumn = colC;
      el._dragOverColumn = colA;
      el._dragInsertAfter = false;
      sinon.stub(el, '_resetDragState');
      sinon.stub(el, 'notifyResize');
      const fireSpy = sinon.spy(el, '_fireSettingsChanged');

      el._onColumnDragEnd();

      expect(fireSpy).to.have.been.calledOnce;
      expect(fireSpy.firstCall.args[0]).to.have.property('source', 'column-reorder');
      el._resetDragState.restore();
      el.notifyResize.restore();
    });
  });

  suite('_resetDragState', () => {
    test('clears all drag state and visual indicators', async () => {
      const el = await newTable();
      el._reorderingColumns = true;
      el._draggingColumn = { name: 'A' };
      el._dragOverColumn = { name: 'B' };
      el._dragInsertAfter = true;
      el._dragCellsMeta = [{}];
      el._dragHeaderLeft = 10;
      sinon.stub(el, '_clearDropIndicators');
      sinon.stub(el, '_clearActiveColumn');

      el._resetDragState();

      expect(el._reorderingColumns).to.be.false;
      expect(el._draggingColumn).to.be.null;
      expect(el._dragOverColumn).to.be.null;
      expect(el._dragInsertAfter).to.be.false;
      expect(el._dragCellsMeta).to.be.null;
      expect(el._dragHeaderLeft).to.be.null;
      expect(el._clearDropIndicators).to.have.been.called;
      expect(el._clearActiveColumn).to.have.been.called;
      el._clearDropIndicators.restore();
      el._clearActiveColumn.restore();
    });
  });

  suite('_onColumnDragMove', () => {
    test('does nothing when reorder is disabled', async () => {
      const el = await newTable();
      el.columnReorderEnabled = false;
      el._draggingColumn = {};
      const spy = sinon.spy(el, '_resolveDropTargetFromX');

      el._onColumnDragMove(100);

      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('does nothing when dragging column is null', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._draggingColumn = null;
      const spy = sinon.spy(el, '_resolveDropTargetFromX');

      el._onColumnDragMove(100);

      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('does nothing when mouseX is not a number', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._draggingColumn = {};
      const spy = sinon.spy(el, '_resolveDropTargetFromX');

      el._onColumnDragMove('notanumber');

      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('delegates to _resolveDropTargetFromX with valid input', async () => {
      const el = await newTable();
      el.columnReorderEnabled = true;
      el._draggingColumn = {};
      const stub = sinon.stub(el, '_resolveDropTargetFromX');

      el._onColumnDragMove(200);

      expect(stub).to.have.been.calledWith(200);
      stub.restore();
    });
  });

  suite('_resolveDropTargetFromX', () => {
    test('does nothing when _dragCellsMeta is null', async () => {
      const el = await newTable();
      el._dragCellsMeta = null;
      el._dragHeaderLeft = 0;

      el._resolveDropTargetFromX(100);

      expect(el._dragOverColumn).to.be.null;
    });

    test('snaps to first column when pointer is before all cells', async () => {
      const el = await newTable();
      const colA = { name: 'A' };
      el._dragHeaderLeft = 0;
      el._dragCellsMeta = [{ column: colA, left: 50, right: 150 }];
      sinon.stub(el, '_setDropEdgeIndicator');

      el._resolveDropTargetFromX(-10);

      expect(el._dragOverColumn).to.equal(colA);
      expect(el._dragInsertAfter).to.be.false;
      expect(el._setDropEdgeIndicator).to.have.been.calledWith(colA);
      el._setDropEdgeIndicator.restore();
    });

    test('clears indicators when pointer is beyond all cells', async () => {
      const el = await newTable();
      const colA = { name: 'A' };
      el._dragHeaderLeft = 0;
      el._dragCellsMeta = [{ column: colA, left: 50, right: 150 }];
      sinon.stub(el, '_clearDropIndicators');

      el._resolveDropTargetFromX(5000);

      expect(el._dragOverColumn).to.be.null;
      expect(el._clearDropIndicators).to.have.been.called;
      el._clearDropIndicators.restore();
    });

    test('resolves to correct column and sets insertAfter based on center', async () => {
      const el = await newTable();
      const colA = { name: 'A' };
      const colB = { name: 'B' };
      el._dragHeaderLeft = 0;
      el._dragCellsMeta = [
        { column: colA, left: 0, right: 100 },
        { column: colB, left: 100, right: 200 },
      ];
      sinon.stub(el, '_setDropEdgeIndicator');

      el._resolveDropTargetFromX(160);

      expect(el._dragOverColumn).to.equal(colB);
      expect(el._dragInsertAfter).to.be.true;
      el._setDropEdgeIndicator.restore();
    });

    test('resolves insertAfter=false when pointer is in left half of target cell', async () => {
      const el = await newTable();
      const colA = { name: 'A' };
      const colB = { name: 'B' };
      el._dragHeaderLeft = 0;
      el._dragCellsMeta = [
        { column: colA, left: 0, right: 100 },
        { column: colB, left: 100, right: 200 },
      ];
      sinon.stub(el, '_setDropEdgeIndicator');

      el._resolveDropTargetFromX(110);

      expect(el._dragOverColumn).to.equal(colB);
      expect(el._dragInsertAfter).to.be.false;
      el._setDropEdgeIndicator.restore();
    });
  });

  // ------------------------------------------------------------------
  // Visual indicator helpers
  // ------------------------------------------------------------------
  suite('_markActiveColumn', () => {
    test('adds column-active class to the matching cell', async () => {
      const el = await newTable();
      const col = { name: 'A' };
      const cell = { column: col, classList: { add: sinon.spy(), remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cell]);

      el._markActiveColumn(col);

      expect(cell.classList.add).to.have.been.calledWith('column-active');
      expect(el._activeColumn).to.equal(col);
    });

    test('removes column-active from previously active column', async () => {
      const el = await newTable();
      const colOld = { name: 'old' };
      const colNew = { name: 'new' };
      const cellOld = { column: colOld, classList: { add: sinon.spy(), remove: sinon.spy() } };
      const cellNew = { column: colNew, classList: { add: sinon.spy(), remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cellOld, cellNew]);
      el._activeColumn = colOld;

      el._markActiveColumn(colNew);

      expect(cellOld.classList.remove).to.have.been.calledWith('column-active');
      expect(cellNew.classList.add).to.have.been.calledWith('column-active');
    });

    test('does nothing when column is already active', async () => {
      const el = await newTable();
      const col = { name: 'A' };
      el._activeColumn = col;
      const spy = sinon.spy(el, '_getHeaderCells');

      el._markActiveColumn(col);

      expect(spy).to.not.have.been.called;
      spy.restore();
    });
  });

  suite('_clearActiveColumn', () => {
    test('removes column-active from all cells and nulls out _activeColumn', async () => {
      const el = await newTable();
      el._activeColumn = { name: 'A' };
      const cell = { classList: { remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cell]);

      el._clearActiveColumn();

      expect(cell.classList.remove).to.have.been.calledWith('column-active');
      expect(el._activeColumn).to.be.null;
    });

    test('does nothing when _activeColumn is already null', async () => {
      const el = await newTable();
      el._activeColumn = null;
      const spy = sinon.spy(el, '_getHeaderCells');

      el._clearActiveColumn();

      expect(spy).to.not.have.been.called;
      spy.restore();
    });
  });

  suite('_clearDropIndicators', () => {
    test('removes drop-left and drop-right from all header cells', async () => {
      const el = await newTable();
      const cell1 = { classList: { remove: sinon.spy() } };
      const cell2 = { classList: { remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cell1, cell2]);

      el._clearDropIndicators();

      expect(cell1.classList.remove).to.have.been.calledWith('drop-left', 'drop-right');
      expect(cell2.classList.remove).to.have.been.calledWith('drop-left', 'drop-right');
    });
  });

  suite('_setDropEdgeIndicator', () => {
    test('adds drop-right to matching cell', async () => {
      const el = await newTable();
      const col = { name: 'target' };
      const cell = { column: col, classList: { add: sinon.spy(), remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cell]);
      sinon.stub(el, '_clearDropIndicators');

      el._setDropEdgeIndicator(col);

      expect(cell.classList.add).to.have.been.calledWith('drop-right');
    });

    test('does nothing when column is null', async () => {
      const el = await newTable();
      const spy = sinon.spy(el, '_clearDropIndicators');

      el._setDropEdgeIndicator(null);

      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('clears existing indicators before setting new one', async () => {
      const el = await newTable();
      const col = { name: 'target' };
      const cell = { column: col, classList: { add: sinon.spy(), remove: sinon.spy() } };
      sinon.stub(el, '_getHeaderCells').returns([cell]);
      const clearSpy = sinon.spy(el, '_clearDropIndicators');

      el._setDropEdgeIndicator(col);

      expect(clearSpy).to.have.been.calledBefore(cell.classList.add);
      clearSpy.restore();
    });
  });
});
