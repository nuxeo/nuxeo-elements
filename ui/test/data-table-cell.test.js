/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-cell.js';

function makeFakeTable(opts = {}) {
  const table = {};
  table.columnReorderEnabled = opts.reorder || false;
  table.columnResizeEnabled = opts.resize || false;
  table._resizing = opts.resizing || null;
  table._onColumnDragMove = sinon.stub();
  table._dragOffsetX = null;
  table._dragStartGhostX = null;
  table._lastDragDirection = null;
  table.hasAttribute = (attr) => {
    if (attr === 'column-resize-enabled') return !!opts.resize;
    return false;
  };
  table.shadowRoot = null;
  return table;
}

suite('nuxeo-data-table-cell extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-data-table-cell></nuxeo-data-table-cell>
      `,
    );
  });

  suite('_alignRightChanged', () => {
    test('sets flexDirection to row-reverse when true', () => {
      el._alignRightChanged(true);
      expect(el.style.flexDirection).to.equal('row-reverse');
    });

    test('sets flexDirection to row when false', () => {
      el._alignRightChanged(false);
      expect(el.style.flexDirection).to.equal('row');
    });
  });

  suite('_hiddenChanged', () => {
    test('adds hidden attribute when true', () => {
      el._hiddenChanged(true);
      expect(el.hasAttribute('hidden')).to.be.true;
    });

    test('removes hidden attribute when false', () => {
      el._hiddenChanged(true);
      el._hiddenChanged(false);
      expect(el.hasAttribute('hidden')).to.be.false;
    });
  });

  suite('_orderChanged', () => {
    test('sets style.order to the given value', () => {
      el._orderChanged(5);
      expect(el.style.order).to.equal('5');
    });

    test('sets style.order to 0', () => {
      el._orderChanged(0);
      expect(el.style.order).to.equal('0');
    });
  });

  suite('_flexChanged', () => {
    test('sets flexGrow when width is not locked', () => {
      el.width = '';
      el.resized = false;
      el._flexChanged(2);
      expect(el.style.flexGrow).to.equal('2');
    });

    test('locks flex when _shouldLockWidth returns true', () => {
      el.width = '200px';
      el.resized = true;
      el._flexChanged(2);
      expect(el.style.flexGrow).to.equal('0');
      expect(el.style.flexShrink).to.equal('0');
    });

    test('sets flexGrow to 0 when no width but resized (shouldLockWidth false)', () => {
      el.width = '';
      el.resized = false;
      el._flexChanged(0);
      expect(el.style.flexGrow).to.equal('0');
    });
  });

  suite('_overflowChanged', () => {
    test('sets overflowX to auto when overflow is "auto"', () => {
      el._overflowChanged('auto');
      expect(el.style.overflowX).to.equal('auto');
    });

    test('sets overflowX to hidden for any other value', () => {
      el._overflowChanged('scroll');
      expect(el.style.overflowX).to.equal('hidden');
    });

    test('sets overflowX to hidden for undefined', () => {
      el._overflowChanged(undefined);
      expect(el.style.overflowX).to.equal('hidden');
    });
  });

  suite('_widthChanged', () => {
    test('locks width when _shouldLockWidth returns true (string width)', () => {
      el.resized = true;
      el._widthChanged('150px', true);
      expect(el.style.flexBasis).to.equal('150px');
      expect(el.style.flexGrow).to.equal('0');
      expect(el.style.flexShrink).to.equal('0');
    });

    test('converts numeric width to px string when locked', () => {
      el.resized = true;
      el._widthChanged(200, true);
      expect(el.style.flexBasis).to.equal('200px');
      expect(el.style.flexGrow).to.equal('0');
    });

    test('clears flex styles when width is falsy', () => {
      el.flex = 3;
      el._widthChanged('', false);
      expect(el.style.flex).to.equal('');
      expect(el.style.flexBasis).to.equal('');
      expect(el.style.flexGrow).to.equal('3');
    });

    test('sets flexBasis with grow when width is provided but not locked', () => {
      el.flex = 2;
      el.resized = false;
      el._widthChanged('100px', false);
      expect(el.style.flex).to.equal('');
      expect(el.style.flexBasis).to.equal('100px');
      expect(el.style.flexGrow).to.equal('2');
    });
  });

  suite('_shouldLockWidth', () => {
    test('returns false when width is falsy', () => {
      expect(el._shouldLockWidth('', false)).to.be.false;
      expect(el._shouldLockWidth(null, true)).to.be.false;
      expect(el._shouldLockWidth(undefined, false)).to.be.false;
    });

    test('returns true when resized is true', () => {
      expect(el._shouldLockWidth('100px', true)).to.be.true;
    });

    test('returns false when width is set but resized is false and no active resizing', () => {
      expect(el._shouldLockWidth('100px', false)).to.be.false;
    });

    test('returns true when table has active resizing column matching this column', () => {
      const col = { name: 'test' };
      el.column = col;
      el.table = { _resizing: { column: col } };
      expect(el._shouldLockWidth('100px', false)).to.be.true;
    });

    test('returns false when table has active resizing column not matching this column', () => {
      el.column = { name: 'a' };
      el.table = { _resizing: { column: { name: 'b' } } };
      expect(el._shouldLockWidth('100px', false)).to.be.false;
    });

    test('returns false when table._resizing exists but column is null', () => {
      el.column = { name: 'a' };
      el.table = { _resizing: { column: null } };
      expect(el._shouldLockWidth('100px', false)).to.be.false;
    });

    test('returns false when table is undefined', () => {
      el.table = undefined;
      expect(el._shouldLockWidth('100px', false)).to.be.false;
    });
  });

  suite('_columnChanged', () => {
    test('sets column on instance when instance exists', () => {
      const instance = {};
      el._columnChanged(instance, { name: 'col1' });
      expect(instance.column).to.deep.equal({ name: 'col1' });
    });

    test('does nothing when instance is null', () => {
      el._columnChanged(null, { name: 'col1' });
    });

    test('does nothing when instance is undefined', () => {
      el._columnChanged(undefined, { name: 'col1' });
    });
  });

  suite('_resetCursor', () => {
    test('clears cursor when not resizing', () => {
      el.style.cursor = 'grab';
      el.classList.remove('resizing');
      el._resetCursor();
      expect(el.style.cursor).to.equal('');
    });

    test('preserves cursor when resizing class is present', () => {
      el.style.cursor = 'col-resize';
      el.classList.add('resizing');
      el._resetCursor();
      expect(el.style.cursor).to.equal('col-resize');
    });
  });

  suite('ready (role/scope attributes)', () => {
    test('non-header cell gets role=cell', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell></nuxeo-data-table-cell>
        `,
      );
      expect(cell.getAttribute('role')).to.equal('cell');
      expect(cell.hasAttribute('scope')).to.be.false;
    });

    test('header cell does not use native-table scope', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      expect(cell.hasAttribute('scope')).to.be.false;
    });

    // ELEMENTS-2005: a custom element cannot be a native `th`, so the header cell must carry the
    // ARIA equivalent for screen readers to announce it as a column header.
    test('header cell gets role=columnheader', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      expect(cell.getAttribute('role')).to.equal('columnheader');
    });
  });

  suite('connectedCallback (header)', () => {
    test('sets draggable true when table has columnReorderEnabled', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      const fakeTable = makeFakeTable({ reorder: true, resize: false });
      sinon.stub(cell, 'closest').returns(fakeTable);
      cell.connectedCallback();
      await new Promise((r) => setTimeout(r, 50));
      expect(cell.draggable).to.be.true;
      cell.closest.restore();
    });

    test('sets resize-enabled attribute when table has column-resize-enabled', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      const fakeTable = makeFakeTable({ reorder: false, resize: true });
      sinon.stub(cell, 'closest').returns(fakeTable);
      cell.connectedCallback();
      await new Promise((r) => setTimeout(r, 50));
      expect(cell.hasAttribute('resize-enabled')).to.be.true;
      cell.closest.restore();
    });

    test('removes resize-enabled when table lacks column-resize-enabled', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      cell.setAttribute('resize-enabled', '');
      const fakeTable = makeFakeTable({ reorder: false, resize: false });
      sinon.stub(cell, 'closest').returns(fakeTable);
      cell.connectedCallback();
      await new Promise((r) => setTimeout(r, 50));
      expect(cell.hasAttribute('resize-enabled')).to.be.false;
      cell.closest.restore();
    });

    test('non-header returns early in connectedCallback', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell></nuxeo-data-table-cell>
        `,
      );
      const stub = sinon.stub(cell, 'closest');
      cell.connectedCallback();
      await new Promise((r) => setTimeout(r, 50));
      expect(stub).to.not.have.been.called;
      stub.restore();
    });

    test('returns early when closest returns null', async () => {
      const cell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(cell, 'closest').returns(null);
      cell.connectedCallback();
      await new Promise((r) => setTimeout(r, 50));
      cell.closest.restore();
    });
  });

  suite('_handleMouseDown', () => {
    let headerCell;
    let fakeTable;

    setup(async () => {
      headerCell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      fakeTable = makeFakeTable({ reorder: true, resize: true });
      sinon.stub(headerCell, 'closest').returns(fakeTable);
    });

    teardown(() => {
      headerCell.closest.restore();
    });

    test('resize intent: near edge adds resizing class and disables draggable', () => {
      const rect = headerCell.getBoundingClientRect();
      const e = { clientX: rect.right - 2 };
      headerCell._handleMouseDown(e);
      expect(headerCell.classList.contains('resizing')).to.be.true;
      expect(headerCell.style.cursor).to.equal('col-resize');
      expect(headerCell.draggable).to.be.false;
    });

    test('reorder intent: away from edge removes resizing and enables draggable', () => {
      headerCell.classList.add('resizing');
      const rect = headerCell.getBoundingClientRect();
      const e = { clientX: rect.left + 5 };
      headerCell._handleMouseDown(e);
      expect(headerCell.classList.contains('resizing')).to.be.false;
      expect(headerCell.draggable).to.be.true;
    });

    test('returns early when no table found', async () => {
      const orphan = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(orphan, 'closest').returns(null);
      orphan._handleMouseDown({ clientX: 0 });
      expect(orphan.classList.contains('resizing')).to.be.false;
      orphan.closest.restore();
    });
  });

  suite('_updateCursor', () => {
    let headerCell;
    let fakeTable;

    setup(async () => {
      headerCell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      fakeTable = makeFakeTable({ reorder: true, resize: true });
      sinon.stub(headerCell, 'closest').returns(fakeTable);
    });

    teardown(() => {
      headerCell.closest.restore();
    });

    test('returns early when no table', async () => {
      const orphan = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(orphan, 'closest').returns(null);
      orphan._updateCursor({ clientX: 0 });
      expect(orphan.style.cursor).to.equal('');
      orphan.closest.restore();
    });

    test('forces col-resize when resizing class is present', () => {
      headerCell.classList.add('resizing');
      const rect = headerCell.getBoundingClientRect();
      headerCell._updateCursor({ clientX: rect.left + 5 });
      expect(headerCell.style.cursor).to.equal('col-resize');
      expect(headerCell.draggable).to.be.false;
    });

    test('sets col-resize near edge without resizing class', () => {
      headerCell.classList.remove('resizing');
      const rect = headerCell.getBoundingClientRect();
      headerCell._updateCursor({ clientX: rect.right - 2 });
      expect(headerCell.style.cursor).to.equal('col-resize');
      expect(headerCell.draggable).to.be.false;
    });

    test('sets grab cursor when reorder enabled and away from edge', () => {
      headerCell.classList.remove('resizing');
      const rect = headerCell.getBoundingClientRect();
      headerCell._updateCursor({ clientX: rect.left + 5 });
      expect(headerCell.style.cursor).to.equal('grab');
      expect(headerCell.draggable).to.be.true;
    });

    test('clears cursor when neither resize nor reorder enabled', () => {
      fakeTable.columnReorderEnabled = false;
      fakeTable.columnResizeEnabled = false;
      headerCell.classList.remove('resizing');
      const rect = headerCell.getBoundingClientRect();
      headerCell._updateCursor({ clientX: rect.left + 5 });
      expect(headerCell.style.cursor).to.equal('');
      expect(headerCell.draggable).to.be.false;
    });
  });

  suite('_onResizerDown', () => {
    let headerCell;
    let fakeTable;

    setup(async () => {
      headerCell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      headerCell.column = { name: 'title' };
      fakeTable = makeFakeTable({ reorder: true, resize: true });
      sinon.stub(headerCell, 'closest').returns(fakeTable);
    });

    teardown(() => {
      headerCell.closest.restore();
    });

    test('dispatches column-resize-start event', () => {
      const spy = sinon.spy();
      headerCell.addEventListener('column-resize-start', spy);
      const e = {
        clientX: 100,
        stopPropagation: sinon.stub(),
        preventDefault: sinon.stub(),
      };
      headerCell._onResizerDown(e);
      expect(e.stopPropagation).to.have.been.called;
      expect(e.preventDefault).to.have.been.called;
      expect(headerCell.draggable).to.be.false;
      expect(headerCell.classList.contains('resizing')).to.be.true;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.column).to.equal(headerCell.column);
    });

    test('handles touch events', () => {
      const spy = sinon.spy();
      headerCell.addEventListener('column-resize-start', spy);
      const e = {
        touches: [{ clientX: 55 }],
        clientX: 0,
        stopPropagation: sinon.stub(),
        preventDefault: sinon.stub(),
      };
      headerCell._onResizerDown(e);
      expect(spy.firstCall.args[0].detail.startX).to.equal(55);
    });

    test('returns early when table not found', async () => {
      const orphan = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(orphan, 'closest').returns(null);
      const spy = sinon.spy();
      orphan.addEventListener('column-resize-start', spy);
      orphan._onResizerDown({ clientX: 0, stopPropagation() {}, preventDefault() {} });
      expect(spy).to.not.have.been.called;
      orphan.closest.restore();
    });

    test('returns early when resize disabled', () => {
      fakeTable.columnResizeEnabled = false;
      const spy = sinon.spy();
      headerCell.addEventListener('column-resize-start', spy);
      headerCell._onResizerDown({ clientX: 0, stopPropagation() {}, preventDefault() {} });
      expect(spy).to.not.have.been.called;
    });
  });

  suite('_onDragStart', () => {
    let headerCell;
    let fakeTable;

    setup(async () => {
      headerCell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      headerCell.draggable = true;
      headerCell.column = { name: 'title' };
      fakeTable = makeFakeTable({ reorder: true, resize: false });
      sinon.stub(headerCell, 'closest').returns(fakeTable);
    });

    teardown(() => {
      headerCell.closest.restore();
      const ghost = document.querySelector('.column-drag-ghost');
      if (ghost) ghost.remove();
    });

    test('prevents default when no table', async () => {
      const orphan = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(orphan, 'closest').returns(null);
      const e = { preventDefault: sinon.stub(), dataTransfer: { setData() {}, setDragImage() {} } };
      orphan._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
      orphan.closest.restore();
    });

    test('prevents default when reorder disabled', () => {
      fakeTable.columnReorderEnabled = false;
      const e = { preventDefault: sinon.stub(), dataTransfer: { setData() {}, setDragImage() {} } };
      headerCell._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
    });

    test('prevents default when table is actively resizing', () => {
      fakeTable._resizing = { column: {} };
      fakeTable.columnReorderEnabled = true;
      const e = { preventDefault: sinon.stub(), dataTransfer: { setData() {}, setDragImage() {} } };
      headerCell._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
    });

    test('prevents default when table._resizing and resizing class combo', () => {
      fakeTable._resizing = { column: headerCell.column };
      fakeTable.columnReorderEnabled = true;
      const e = { preventDefault: sinon.stub(), dataTransfer: { setData() {}, setDragImage() {} } };
      headerCell._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
      fakeTable._resizing = null;
    });

    test('prevents default when draggable is false', () => {
      headerCell.draggable = false;
      const e = { preventDefault: sinon.stub(), dataTransfer: { setData() {}, setDragImage() {} } };
      headerCell._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
    });

    test('prevents default when click is near resize edge', () => {
      const rect = headerCell.getBoundingClientRect();
      const e = {
        clientX: rect.right - 2,
        preventDefault: sinon.stub(),
        dataTransfer: { setData() {}, setDragImage() {}, effectAllowed: '' },
      };
      headerCell._onDragStart(e);
      expect(e.preventDefault).to.have.been.called;
    });

    test('success path: creates ghost, dispatches event, sets dragging class', () => {
      const rect = headerCell.getBoundingClientRect();
      const spy = sinon.spy();
      headerCell.addEventListener('column-drag-start', spy);
      const e = {
        clientX: rect.left + 5,
        preventDefault: sinon.stub(),
        dataTransfer: {
          setData: sinon.stub(),
          setDragImage: sinon.stub(),
          effectAllowed: '',
        },
      };
      headerCell._onDragStart(e);
      expect(headerCell.classList.contains('dragging')).to.be.true;
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.column).to.equal(headerCell.column);
      expect(document.querySelector('.column-drag-ghost')).to.exist;
      expect(e.dataTransfer.setDragImage).to.have.been.called;
    });
  });

  suite('_onDragEnd', () => {
    let headerCell;
    let fakeTable;

    setup(async () => {
      headerCell = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      headerCell.column = { name: 'title' };
      fakeTable = makeFakeTable({ reorder: true, resize: false });
      sinon.stub(headerCell, 'closest').returns(fakeTable);
    });

    teardown(() => {
      headerCell.closest.restore();
      const ghost = document.querySelector('.column-drag-ghost');
      if (ghost) ghost.remove();
    });

    test('cleans up ghost element and fires column-drag-end', () => {
      const ghost = document.createElement('div');
      ghost.classList.add('column-drag-ghost');
      document.body.appendChild(ghost);
      headerCell.classList.add('dragging');
      headerCell.style.cursor = 'grabbing';

      const spy = sinon.spy();
      headerCell.addEventListener('column-drag-end', spy);
      headerCell._onDragEnd();

      expect(document.querySelector('.column-drag-ghost')).to.be.null;
      expect(headerCell.classList.contains('dragging')).to.be.false;
      expect(headerCell.style.cursor).to.equal('');
      expect(spy).to.have.been.calledOnce;
    });

    test('calls _cleanupGhostMove when defined', () => {
      const cleanup = sinon.stub();
      headerCell._cleanupGhostMove = cleanup;
      headerCell._onDragEnd();
      expect(cleanup).to.have.been.called;
    });

    test('restores draggable based on table.columnReorderEnabled', () => {
      headerCell.draggable = false;
      headerCell._onDragEnd();
      expect(headerCell.draggable).to.be.true;
    });

    test('sets draggable false when no table', async () => {
      const orphan = await fixture(
        html`
          <nuxeo-data-table-cell header></nuxeo-data-table-cell>
        `,
      );
      sinon.stub(orphan, 'closest').returns(null);
      orphan.draggable = true;
      orphan._onDragEnd();
      expect(orphan.draggable).to.be.false;
      orphan.closest.restore();
    });

    test('handles missing ghost gracefully', () => {
      headerCell._onDragEnd();
      expect(headerCell.classList.contains('dragging')).to.be.false;
    });
  });
});
