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
import { fixture, html, login } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-file.js';
import { UploaderBehavior } from '../widgets/nuxeo-uploader-behavior.js';

suite('Nuxeo.UploaderBehavior', () => {
  let DefaultUploadProvider;
  setup(async () => {
    DefaultUploadProvider = UploaderBehavior.getProviders().default;
    const MyProvider = function() {};
    MyProvider.prototype.accepts = DefaultUploadProvider.prototype.accepts;
    MyProvider.prototype.upload = DefaultUploadProvider.prototype.upload;
    MyProvider.prototype.hasProgress = DefaultUploadProvider.prototype.hasProgress;
    MyProvider.prototype.cancelBatch = DefaultUploadProvider.prototype.cancelBatch;
    MyProvider.prototype.batchExecute = DefaultUploadProvider.prototype.batchExecute;
    UploaderBehavior.registerProvider('myProvider', MyProvider);

    await login();
  });

  suite('upload providers', () => {
    let noProvider;
    let withProvider;

    setup(async () => {
      noProvider = await fixture(
        html`
          <nuxeo-file></nuxeo-file>
        `,
      );
      withProvider = await fixture(
        html`
          <nuxeo-file provider="myProvider"></nuxeo-file>
        `,
      );
    });

    test('can contribute a new upload provider', () => {
      const MyProvider2 = function() {};
      MyProvider2.prototype.accepts = DefaultUploadProvider.prototype.accepts;
      MyProvider2.prototype.upload = DefaultUploadProvider.prototype.upload;
      MyProvider2.prototype.hasProgress = DefaultUploadProvider.prototype.hasProgress;
      MyProvider2.prototype.cancelBatch = DefaultUploadProvider.prototype.cancelBatch;
      MyProvider2.prototype.batchExecute = DefaultUploadProvider.prototype.batchExecute;
      UploaderBehavior.registerProvider('myProvider2', MyProvider2);
      expect(UploaderBehavior.defaultProvider).to.be.equal('default');
      expect(Object.keys(UploaderBehavior.getProviders())).to.have.all.members([
        'default',
        'myProvider',
        'myProvider2',
      ]);
    });

    test('can have elements with both default and explicit providers', () => {
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });

    test('can switch default provider', () => {
      UploaderBehavior.defaultProvider = 'myProvider';
      expect(noProvider._provider).to.be.equal('myProvider');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);

      UploaderBehavior.defaultProvider = 'default';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });

    test('can switch provider for a single element', () => {
      noProvider.provider = 'default';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.equal(noProvider._provider);
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);

      UploaderBehavior.defaultProvider = 'myProvider';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.equal(noProvider._provider);
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });
  });
});
