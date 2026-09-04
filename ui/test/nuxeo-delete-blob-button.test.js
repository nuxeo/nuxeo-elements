/**
 @license
 ©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { fixture, flush, html, isElementVisible } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom';
import '../actions/nuxeo-delete-blob-button.js';

const isActionDivVisible = (button) => isElementVisible(dom(button.root).querySelector('.action'));

suite('nuxeo-delete-blob-button', () => {
  let button;

  setup(async () => {
    button = await fixture(
      html`
        <nuxeo-delete-blob-button></nuxeo-delete-blob-button>
      `,
    );
    sinon.stub(button, 'isImmutable').returns(false);
    sinon.stub(button, 'hasType').returns(false);
    sinon.stub(button, 'isTrashed').returns(false);
  });

  suite('Button Visibility', () => {
    test('Should not be visible when no permission is granted', async () => {
      button.document = {
        contextParameters: {
          permissions: [],
        },
      };
      await flush();
      expect(isActionDivVisible(button)).to.be.false;
    });

    test('Should not be visible when only the "Read" permission is granted', async () => {
      button.document = {
        contextParameters: {
          permissions: ['Read'],
        },
      };
      await flush();
      expect(isActionDivVisible(button)).to.be.false;
    });

    test('Should be visible when the "WriteProperties" permission is granted', async () => {
      button.document = {
        contextParameters: {
          permissions: ['WriteProperties'],
        },
      };
      await flush();
      expect(isActionDivVisible(button)).to.be.true;
    });
  });

  suite('should return whether property is under retention', () => {
    const document = {
      isUnderRetentionOrLegalHold: true,
      retainedProperties: [
        'checkext:single',
        'checkext:field1/2/item',
        'files:files/*/file',
        'checkext:multiple',
        'file:content',
      ],
    };
    test('when xpath =  checkext:single, for document blob', () => {
      button.xpath = 'checkext:single';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
    test('when xpath =  checkext:multiple/0, for document attachement', () => {
      button.xpath = 'checkext:multiple/0';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
    test('when xpath =  checkext:multiple/1, for document attachement', () => {
      button.xpath = 'checkext:multiple/1';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
    test('when xpath =  checkext:field1/0, for custom property - document attachment', () => {
      button.xpath = 'checkext:field1/0';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(true);
    });
    test('when xpath =  checkext:field1/2, for custom property - document attachment', () => {
      button.xpath = 'checkext:field1/2';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
    test('when xpath =  files:files/0/file, for document attachement', () => {
      button.xpath = 'files:files/0/file';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
    test('when xpath =  file:content, for document viewer', () => {
      button.xpath = 'file:content';
      sinon.stub(button, 'hasPermission').returns(true);
      expect(button._isAvailable(document)).to.eql(false);
    });
  });
});

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

  suite('accessible name', () => {
    test('names what is removed, rather than reusing the bare tooltip', () => {
      expect(el._computeAriaLabel()).to.equal(el.i18n('deleteBlobButton.ariaLabel'));
      expect(el._computeAriaLabel()).to.not.equal(el._computeLabel());
    });

    test('exposes the accessible name on the icon button', async () => {
      const button = await fixture(
        html`
          <nuxeo-delete-blob-button
            document='{ "entity-type": "document", "facets": [], "contextParameters": { "permissions": ["WriteProperties"] }, "properties": { "file:content": { "name": "file.pdf" } } }'
          ></nuxeo-delete-blob-button>
        `,
      );
      await flush();
      const iconButton = button.shadowRoot.querySelector('paper-icon-button');
      expect(iconButton).to.exist;
      expect(iconButton.getAttribute('aria-label')).to.equal(button.i18n('deleteBlobButton.ariaLabel'));
      expect(iconButton.hasAttribute('aria-labelledby')).to.be.false;
    });
  });
});
