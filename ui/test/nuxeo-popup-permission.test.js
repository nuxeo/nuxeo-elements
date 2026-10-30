/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import moment from '@nuxeo/moment';
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-permissions/nuxeo-popup-permission.js';

suite('nuxeo-popup-permission', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-popup-permission></nuxeo-popup-permission>
    `);
  });

  test('returns a local permission label by default', () => {
    expect(el._computeNewPermissionLabel(false)).to.equal(el.i18n('popupPermission.newLocalPermission'));
  });

  test('returns an external permission label when sharing externally', () => {
    expect(el._computeNewPermissionLabel(true)).to.equal(el.i18n('popupPermission.newExternalPermission'));
  });
  test('preserves the exact access window on an unchanged update', () => {
    const begin = '2026-11-01T02:00:00.000Z';
    const end = '2026-12-31T23:30:00.000Z';
    el.ace = { id: 'ace-1', username: 'members', permission: 'Read', begin, end };
    el._computeParams(el.ace, false);
    const execute = sinon.stub(el.$.replaceOp, 'execute').resolves();
    el._doSend(false);
    expect(el.params.begin).to.equal(begin);
    expect(el.params.end).to.equal(end);
    expect(execute.calledOnce).to.be.true;
    execute.restore();
  });

  test('serializes changed dates and empty dates with the existing rules', () => {
    expect(el._serializePermissionDate('')).to.equal(null);
    expect(el._serializePermissionDate('2026-01-20')).to.equal(moment(new Date('2026-01-20')).format());
    expect(el._serializePermissionDate('2026-01-20', null, true)).to.equal(
      moment(new Date('2026-01-20'))
        .endOf('day')
        .format(),
    );
  });
});
