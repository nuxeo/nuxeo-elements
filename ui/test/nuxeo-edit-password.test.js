/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-edit-password.js';

suite('nuxeo-edit-password', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-edit-password></nuxeo-edit-password>
      `,
    );
    await flush();
  });

  suite('_computeErrorMessage', () => {
    test('returns required message when password is empty', () => {
      expect(el._computeErrorMessage('')).to.equal(el.i18n('editPassword.required'));
    });

    test('returns no-match message when password is set', () => {
      expect(el._computeErrorMessage('secret')).to.equal(el.i18n('editPassword.noMatch'));
    });
  });

  suite('_getValidity', () => {
    test('delegates to passwordConfirmation validate', () => {
      sinon.stub(el.$.passwordConfirmation, 'validate').returns(true);
      expect(el._getValidity()).to.be.true;
      expect(el.$.passwordConfirmation.validate).to.have.been.calledOnce;
      el.$.passwordConfirmation.validate.restore();
    });
  });

  suite('resetFields', () => {
    test('clears password and confirmation', () => {
      el.password = 'a';
      el._confirmationPassword = 'b';
      el.resetFields();
      expect(el.password).to.equal('');
      expect(el._confirmationPassword).to.equal('');
    });
  });
});
