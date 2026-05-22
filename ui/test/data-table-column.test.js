/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-column.js';

suite('nuxeo-data-table-column extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-data-table-column>
          <template><span>[[item.name]]</span></template>
        </nuxeo-data-table-column>
      `,
    );
  });

  suite('_notifyTable', () => {
    test('no-op when table is null', () => {
      el._notifyTable(null, 'name', 'test');
    });

    test('no-op when table has no columns', () => {
      el._notifyTable({}, 'name', 'test');
    });

    test('notifies table when column is found', () => {
      const table = {
        columns: [el],
        notifyPath: sinon.stub(),
      };
      el._notifyTable(table, 'name', 'test');
      expect(table.notifyPath).to.have.been.calledWith('columns.0.name', 'test');
    });
  });

  suite('_filterValueChanged', () => {
    test('dispatches event when filterBy and filterValue present', () => {
      const spy = sinon.spy();
      el.addEventListener('column-filter-changed', spy);
      const table = {
        columns: [el],
        notifyPath: sinon.stub(),
      };
      el._filterValueChanged(table, 'search', 'dc:title', null);
      expect(spy).to.have.been.calledOnce;
    });

    test('no-op when table is null', () => {
      el._filterValueChanged(null, 'search', 'dc:title', null);
    });

    test('no-op when filterBy is null', () => {
      const table = { columns: [el], notifyPath: sinon.stub() };
      el._filterValueChanged(table, 'search', null, null);
      expect(table.notifyPath).to.not.have.been.called;
    });

    test('no-op when filterValue is undefined', () => {
      const table = { columns: [el], notifyPath: sinon.stub() };
      el._filterValueChanged(table, undefined, 'dc:title', null);
      expect(table.notifyPath).to.not.have.been.called;
    });
  });

  suite('observer delegates', () => {
    test('_alignRightChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._alignRightChanged('t', true);
      expect(stub).to.have.been.calledWith('t', 'alignRight', true);
      stub.restore();
    });

    test('_nameChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._nameChanged('t', 'Name');
      expect(stub).to.have.been.calledWith('t', 'name', 'Name');
      stub.restore();
    });

    test('_hiddenChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._hiddenChanged('t', true);
      expect(stub).to.have.been.calledWith('t', 'hidden', true);
      stub.restore();
    });

    test('_flexChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._flexChanged('t', 2);
      expect(stub).to.have.been.calledWith('t', 'flex', 2);
      stub.restore();
    });

    test('_overflowChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._overflowChanged('t', 'auto');
      expect(stub).to.have.been.calledWith('t', 'overflow', 'auto');
      stub.restore();
    });

    test('_widthChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._widthChanged('t', '200px');
      expect(stub).to.have.been.calledWith('t', 'width', '200px');
      stub.restore();
    });

    test('_orderChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._orderChanged('t', 3);
      expect(stub).to.have.been.calledWith('t', 'order', 3);
      stub.restore();
    });

    test('_sortByChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._sortByChanged('t', 'dc:title');
      expect(stub).to.have.been.calledWith('t', 'sortBy', 'dc:title');
      stub.restore();
    });

    test('_resizedChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._resizedChanged('t', true);
      expect(stub).to.have.been.calledWith('t', 'resized', true);
      stub.restore();
    });

    test('_alwaysVisibleChanged calls _notifyTable', () => {
      const stub = sinon.stub(el, '_notifyTable');
      el._alwaysVisibleChanged('t', true);
      expect(stub).to.have.been.calledWith('t', 'alwaysVisible', true);
      stub.restore();
    });
  });
});
