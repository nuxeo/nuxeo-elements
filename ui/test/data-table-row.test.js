/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-row.js';

suite('nuxeo-data-table-row extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-data-table-row></nuxeo-data-table-row>
      `,
    );
  });

  suite('_beforeBind', () => {
    test('returns early when beforeBind is falsy', () => {
      el._beforeBind(null, 0, { base: {} }, false, false);
    });

    test('calls beforeBind with correct data', () => {
      const spy = sinon.stub();
      const item = { base: { uid: '1' } };
      el._beforeBind(spy, 5, item, true, false);
      expect(spy).to.have.been.calledOnce;
      const data = spy.firstCall.args[0];
      expect(data.index).to.equal(5);
      expect(data.item).to.deep.equal({ uid: '1' });
      expect(data.selected).to.be.true;
      expect(data.expanded).to.be.false;
    });

    test('calls beforeBind with expanded=true', () => {
      const spy = sinon.stub();
      el._beforeBind(spy, 0, { base: {} }, false, true);
      expect(spy.firstCall.args[0].expanded).to.be.true;
    });
  });

  suite('connectedCallback', () => {
    test('sets tabindex and role attributes', () => {
      expect(el.getAttribute('tabindex')).to.equal('0');
      expect(el.getAttribute('role')).to.equal('row');
    });
  });

  // WEBUI-1557: the wrapper between the row and its cells must stay out of the accessibility
  // tree, otherwise browsers cannot build the table model and column headers are never
  // associated with the body cells.
  suite('accessibility structure', () => {
    test('cells wrapper is presentational', () => {
      expect(el.shadowRoot.querySelector('.cells').getAttribute('role')).to.equal('presentation');
    });
  });
});
