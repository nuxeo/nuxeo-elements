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
