/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-delete-blob-button.js';

suite('nuxeo-delete-blob-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-delete-blob-button></nuxeo-delete-blob-button>
      `,
    );
    sinon.stub(el, 'isImmutable').returns(false);
    sinon.stub(el, 'hasType').returns(false);
    sinon.stub(el, 'isTrashed').returns(false);
    sinon.stub(el, 'hasPermission').returns(true);
  });

  suite('_isAvailable', () => {
    test('returns falsy when doc is null', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });

    test('returns falsy when doc is undefined', () => {
      expect(el._isAvailable(undefined)).to.not.be.ok;
    });

    test('returns true when doc has all permissions and no restrictions', () => {
      const doc = { contextParameters: { permissions: ['WriteProperties'] } };
      expect(el._isAvailable(doc)).to.be.true;
    });

    test('returns false when doc has no WriteProperties permission', () => {
      el.hasPermission.returns(false);
      const doc = { contextParameters: { permissions: ['Read'] } };
      expect(el._isAvailable(doc)).to.be.false;
    });

    test('returns false when doc is immutable', () => {
      el.isImmutable.returns(true);
      const doc = { contextParameters: { permissions: ['WriteProperties'] } };
      expect(el._isAvailable(doc)).to.be.false;
    });

    test('returns false when doc is of type Root', () => {
      el.hasType.returns(true);
      const doc = { contextParameters: { permissions: ['WriteProperties'] } };
      expect(el._isAvailable(doc)).to.be.false;
    });

    test('returns false when doc is trashed', () => {
      el.isTrashed.returns(true);
      const doc = { contextParameters: { permissions: ['WriteProperties'] } };
      expect(el._isAvailable(doc)).to.be.false;
    });

    test('returns false when property is under retention', () => {
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['file:content'],
        contextParameters: { permissions: ['WriteProperties'] },
      };
      el.xpath = 'file:content';
      expect(el._isAvailable(doc)).to.be.false;
    });
  });

  suite('_isPropUnderRetention', () => {
    test('returns false when doc is null', () => {
      expect(el._isPropUnderRetention(null)).to.be.false;
    });

    test('returns false when doc is undefined', () => {
      expect(el._isPropUnderRetention(undefined)).to.be.false;
    });

    test('returns false when not under retention', () => {
      const doc = { isUnderRetentionOrLegalHold: false, retainedProperties: ['file:content'] };
      expect(el._isPropUnderRetention(doc)).to.be.false;
    });

    test('returns false when retainedProperties is empty', () => {
      const doc = { isUnderRetentionOrLegalHold: true, retainedProperties: [] };
      expect(el._isPropUnderRetention(doc)).to.be.false;
    });

    test('returns false when retainedProperties is missing', () => {
      const doc = { isUnderRetentionOrLegalHold: true };
      expect(el._isPropUnderRetention(doc)).to.be.false;
    });

    test('matches exact xpath via prop.startsWith', () => {
      el.xpath = 'checkext:field1/2/item';
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['checkext:field1/2/item'],
      };
      expect(el._isPropUnderRetention(doc)).to.be.ok;
    });

    test('matches wildcard retained property via _transformXpathRegex', () => {
      el.xpath = 'files:files/0/file';
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['files:files/*/file'],
      };
      expect(el._isPropUnderRetention(doc)).to.be.ok;
    });

    test('matches prefix without slash (simple schema)', () => {
      el.xpath = 'checkext:multiple/0';
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['checkext:multiple'],
      };
      expect(el._isPropUnderRetention(doc)).to.be.ok;
    });

    test('does not match unrelated retained property', () => {
      el.xpath = 'other:field';
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['file:content'],
      };
      expect(el._isPropUnderRetention(doc)).to.not.be.ok;
    });
  });

  suite('_transformXpathRegex', () => {
    test('returns true when prop with star matches xpath with numeric segment', () => {
      expect(el._transformXpathRegex('files:files/*/file', 'files:files/0/file')).to.be.true;
    });

    test('returns true when prop with star matches xpath with different numeric segment', () => {
      expect(el._transformXpathRegex('files:files/*/file', 'files:files/3/file')).to.be.true;
    });

    test('returns false when prop with star does not match xpath', () => {
      expect(el._transformXpathRegex('files:files/*/file', 'other:field/0/file')).to.be.false;
    });

    test('returns true when prop equals xpath exactly and no star', () => {
      expect(el._transformXpathRegex('file:content', 'file:content')).to.be.true;
    });

    test('returns false when prop does not equal xpath and no star', () => {
      expect(el._transformXpathRegex('file:content', 'other:content')).to.be.false;
    });

    test('handles multiple numeric segments in xpath', () => {
      expect(el._transformXpathRegex('schema:field/*/sub/*/item', 'schema:field/2/sub/5/item')).to.be.true;
    });

    test('returns false when xpath has non-numeric where star is', () => {
      expect(el._transformXpathRegex('files:files/*/file', 'files:files/abc/file')).to.be.false;
    });
  });

  suite('_params', () => {
    test('splits on /file for files: prefix xpath', () => {
      const result = el._params('files:files/0/file');
      expect(result.xpath).to.equal('files:files/0');
    });

    test('returns xpath as-is when no files: prefix', () => {
      const result = el._params('file:content');
      expect(result.xpath).to.equal('file:content');
    });

    test('splits on first /file occurrence for files: prefix', () => {
      const result = el._params('files:files/1/file');
      expect(result.xpath).to.equal('files:files/1');
    });

    test('returns full xpath when not starting with files:', () => {
      const result = el._params('custom:blob');
      expect(result.xpath).to.equal('custom:blob');
    });

    test('returns xpath with files: but no /file in path', () => {
      const result = el._params('files:main');
      expect(result.xpath).to.equal('files:main');
    });
  });

  suite('_computeLabel', () => {
    test('returns a string from i18n', () => {
      const result = el._computeLabel();
      expect(result).to.be.a('string');
    });
  });

  suite('_remove', () => {
    test('calls _removeBlob when no rowNo in xpath', () => {
      el.xpath = 'file:content';
      el.document = { properties: {} };
      const spy = sinon.stub(el, '_removeBlob');
      el._remove();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('calls _removeBlob when xpath has rowNo but no matching property', () => {
      el.xpath = 'files:files/0';
      el.document = { properties: { 'files:files': null } };
      const spy = sinon.stub(el, '_removeBlob');
      el._remove();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('calls _removeBlob when fichier exists but no upload-batch', () => {
      el.xpath = 'att:files/0';
      el.document = {
        properties: {
          'att:files': [{ fichier: { 'upload-batch': null, 'upload-fileId': null } }],
        },
      };
      const spy = sinon.stub(el, '_removeBlob');
      el._remove();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_dispatchEvent', () => {
    test('dispatches a custom event with response detail', (done) => {
      el.addEventListener('test-event', (e) => {
        expect(e.detail.response).to.equal('data');
        done();
      });
      el._dispatchEvent('test-event', 'data');
    });
  });

  suite('_toggleDialog', () => {
    test('toggles the dialog', () => {
      const spy = sinon.spy(el.$.dialog, 'toggle');
      el._toggleDialog();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });
});
