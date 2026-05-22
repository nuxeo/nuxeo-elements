/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import '../nuxeo-data-table/data-table-templatizer-behavior.js';

const impl = saulis.DataTableTemplatizerBehaviorImpl;

suite('DataTableTemplatizerBehavior extras', () => {
  suite('_templatize', () => {
    test('returns undefined when template is null', () => {
      expect(impl._templatize(null)).to.be.undefined;
    });

    test('returns undefined when template is undefined', () => {
      expect(impl._templatize(undefined)).to.be.undefined;
    });

    test('returns undefined for empty string', () => {
      expect(impl._templatize('')).to.be.undefined;
    });
  });

  suite('_expandedChanged', () => {
    test('sets expanded on instance when instance exists', () => {
      const instance = {};
      impl._expandedChanged(instance, true);
      expect(instance.expanded).to.be.true;
    });

    test('sets expanded false on instance', () => {
      const instance = {};
      impl._expandedChanged(instance, false);
      expect(instance.expanded).to.be.false;
    });

    test('does nothing when instance is null', () => {
      impl._expandedChanged(null, true);
    });

    test('stores expanded value on this', () => {
      const ctx = {};
      impl._expandedChanged.call(ctx, null, true);
      expect(ctx._expanded).to.be.true;
    });
  });

  suite('_indexChanged', () => {
    test('sets index on instance when instance exists', () => {
      const instance = {};
      impl._indexChanged(instance, 5);
      expect(instance.index).to.equal(5);
    });

    test('does nothing when instance is null', () => {
      impl._indexChanged(null, 5);
    });
  });

  suite('_itemChanged', () => {
    test('sets item on instance when instance exists', () => {
      const instance = {};
      const item = { uid: '1' };
      impl._itemChanged(instance, item);
      expect(instance.item).to.equal(item);
    });

    test('does nothing when instance is null', () => {
      impl._itemChanged(null, { uid: '1' });
    });
  });

  suite('_itemPathChanged', () => {
    test('calls notifyPath on instance', () => {
      const instance = { notifyPath: sinon.spy() };
      const ctx = { _parentProps: null };
      impl._itemPathChanged.call(ctx, instance, { path: 'item.name', value: 'x' });
      expect(instance.notifyPath).to.have.been.calledWith('item.name', 'x');
    });

    test('initializes _parentProps if undefined', () => {
      const instance = { notifyPath: sinon.spy() };
      const ctx = {};
      impl._itemPathChanged.call(ctx, instance, { path: 'item.x', value: 1 });
      expect(ctx._parentProps).to.be.an('object');
    });

    test('does nothing when instance is null', () => {
      const ctx = {};
      impl._itemPathChanged.call(ctx, null, { path: 'item.x', value: 1 });
    });
  });

  suite('_selectedChanged', () => {
    test('sets selected on instance when instance exists', () => {
      const instance = {};
      impl._selectedChanged(instance, true);
      expect(instance.selected).to.be.true;
    });

    test('stores _selected on context', () => {
      const ctx = {};
      impl._selectedChanged.call(ctx, null, false);
      expect(ctx._selected).to.be.false;
    });

    test('does nothing when instance is null', () => {
      impl._selectedChanged(null, true);
    });
  });

  suite('_forwardHostPropV2', () => {
    test('stores prop in _forwardedParentProps and updates instance', () => {
      const ctx = { _forwardedParentProps: {}, _instance: {} };
      impl._forwardHostPropV2.call(ctx, 'myProp', 42);
      expect(ctx._forwardedParentProps.myProp).to.equal(42);
      expect(ctx._instance.myProp).to.equal(42);
    });

    test('stores prop even when _instance is null', () => {
      const ctx = { _forwardedParentProps: {}, _instance: null };
      impl._forwardHostPropV2.call(ctx, 'myProp', 'val');
      expect(ctx._forwardedParentProps.myProp).to.equal('val');
    });
  });

  suite('_notifyInstancePropV2', () => {
    test('expands item when prop=expanded, value=true', () => {
      const table = { expandItem: sinon.spy(), collapseItem: sinon.spy() };
      const ctx = { table, _expanded: false };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'expanded', true);
      expect(table.expandItem).to.have.been.calledOnce;
    });

    test('collapses item when prop=expanded, value=false', () => {
      const table = { expandItem: sinon.spy(), collapseItem: sinon.spy() };
      const ctx = { table, _expanded: true };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'expanded', false);
      expect(table.collapseItem).to.have.been.calledOnce;
    });

    test('does nothing for expanded when value matches _expanded', () => {
      const table = { expandItem: sinon.spy(), collapseItem: sinon.spy() };
      const ctx = { table, _expanded: true };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'expanded', true);
      expect(table.expandItem).not.to.have.been.called;
    });

    test('selects item when prop=selected, value=true', () => {
      const table = { selectItem: sinon.spy(), deselectItem: sinon.spy() };
      const ctx = { table, _selected: false };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'selected', true);
      expect(table.selectItem).to.have.been.calledOnce;
    });

    test('deselects item when prop=selected, value=false', () => {
      const table = { selectItem: sinon.spy(), deselectItem: sinon.spy() };
      const ctx = { table, _selected: true };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'selected', false);
      expect(table.deselectItem).to.have.been.calledOnce;
    });

    test('does nothing for selected when value matches _selected', () => {
      const table = { selectItem: sinon.spy(), deselectItem: sinon.spy() };
      const ctx = { table, _selected: true };
      impl._notifyInstancePropV2.call(ctx, { item: { uid: 1 } }, 'selected', true);
      expect(table.selectItem).not.to.have.been.called;
    });

    test('does nothing when inst.item is falsy', () => {
      const table = { expandItem: sinon.spy() };
      const ctx = { table, _expanded: false };
      impl._notifyInstancePropV2.call(ctx, { item: null }, 'expanded', true);
      expect(table.expandItem).not.to.have.been.called;
    });
  });

  suite('_forwardInstancePath', () => {
    test('dispatches item-changed when path starts with "item"', (done) => {
      const table = document.createElement('div');
      const ctx = { table };
      table.addEventListener('item-changed', (e) => {
        expect(e.detail.path).to.equal('name');
        expect(e.detail.value).to.equal('foo');
        done();
      });
      impl._forwardInstancePath.call(ctx, { item: { uid: 1 } }, 'item.name', 'foo');
    });

    test('does nothing when path does not start with "item"', () => {
      const table = { _debouncer: null, dispatchEvent: sinon.spy() };
      const ctx = { table };
      impl._forwardInstancePath.call(ctx, {}, 'other.path', 'val');
      expect(table.dispatchEvent).not.to.have.been.called;
    });
  });

  suite('created / detached', () => {
    test('created initializes _instanceProps', () => {
      const ctx = {};
      impl.created.call(ctx);
      expect(ctx._instanceProps).to.have.property('column', true);
      expect(ctx._instanceProps).to.have.property('expanded', true);
      expect(ctx._instanceProps).to.have.property('index', true);
      expect(ctx._instanceProps).to.have.property('item', true);
      expect(ctx._instanceProps).to.have.property('selected', true);
    });

    test('detached nullifies table and _instance', () => {
      const ctx = { table: {}, _instance: {} };
      impl.detached.call(ctx);
      expect(ctx.table).to.be.null;
      expect(ctx._instance).to.be.null;
    });
  });
});
