/**
 @license
 (C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
import { expect } from '@esm-bundle/chai';
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
});
