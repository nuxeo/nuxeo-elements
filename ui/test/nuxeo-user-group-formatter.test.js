/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-user-group-formatter.js';

suite('nuxeo-user-group-formatter', () => {
  let el;

  suite('with a USER_TYPE entity', () => {
    setup(async () => {
      el = await fixture(html`
        <nuxeo-user-group-formatter
          .entity="${{
            type: 'USER_TYPE',
            id: 'jdoe',
            email: 'jdoe@test.com',
            displayLabel: 'John Doe',
          }}"
        ></nuxeo-user-group-formatter>
      `);
    });

    test('_isUser returns true', () => {
      expect(el._isUser()).to.be.true;
    });

    test('_isGroup returns false', () => {
      expect(el._isGroup()).to.be.false;
    });

    test('_computeInfo returns email and id', () => {
      expect(el._computeInfo()).to.equal('jdoe@test.com - jdoe');
    });
  });

  suite('with a GROUP_TYPE entity', () => {
    setup(async () => {
      el = await fixture(html`
        <nuxeo-user-group-formatter
          .entity="${{
            type: 'GROUP_TYPE',
            id: 'admins',
            displayLabel: 'Administrators',
          }}"
        ></nuxeo-user-group-formatter>
      `);
    });

    test('_isUser returns false', () => {
      expect(el._isUser()).to.be.false;
    });

    test('_isGroup returns true', () => {
      expect(el._isGroup()).to.be.true;
    });

    test('_computeInfo returns group label and id', () => {
      const info = el._computeInfo();
      expect(info).to.contain(' - admins');
    });
  });
});
