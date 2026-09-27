/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
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
});
