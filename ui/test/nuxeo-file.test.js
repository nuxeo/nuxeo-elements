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
import { fixture, html, login } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-file.js';

suite('nuxeo-file', () => {
  let element;
  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-file></nuxeo-file>
      `,
    );
  });

  suite('should return whether property is under retention', () => {
    test('when file:content is a retained property && xpath =  file:content', () => {
      const document = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['file:content'],
      };
      element.xpath = 'file:content';
      expect(element._isDropzoneVisible(document)).to.eql(true);
    });
    test('when file:content is not a retained property && xpath =  file:content', () => {
      const document = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: [],
      };
      element.xpath = 'file:content';
      expect(element._isDropzoneVisible(document)).to.eql(false);
    });
  });
});

suite('nuxeo-file (extras)', () => {
  let element;

  setup(async () => {
    await login();
    element = await fixture(
      html`
        <nuxeo-file></nuxeo-file>
      `,
    );
  });

  suite('_fileName', () => {
    test('returns file.name when present', () => {
      expect(element._fileName({ name: 'report.pdf', _name: 'fallback.pdf' })).to.equal('report.pdf');
    });

    test('returns file._name when name is absent', () => {
      expect(element._fileName({ _name: 'uploaded.docx' })).to.equal('uploaded.docx');
    });

    test('returns name from files array via upload-fileId', () => {
      element.files = [new window.File([''], 'batch-file.txt', { type: 'text/plain' })];
      expect(element._fileName({ 'upload-fileId': '0' })).to.equal('batch-file.txt');
    });
  });

  suite('_data', () => {
    test('returns file.data when present', () => {
      expect(element._data({ data: '/nuxeo/data/file.pdf', _url: 'blob:local' })).to.equal('/nuxeo/data/file.pdf');
    });

    test('returns file._url when data is absent', () => {
      expect(element._data({ _url: 'blob:http://localhost/abc' })).to.equal('blob:http://localhost/abc');
    });

    test('creates object URL via upload-fileId when data and _url are absent', () => {
      const file = new window.File(['hello'], 'test.txt', { type: 'text/plain' });
      element.files = [file];
      const result = element._data({ 'upload-fileId': '0' });
      expect(result).to.be.a('string');
      expect(result).to.include('blob:');
    });
  });

  suite('_getValidity', () => {
    test('returns false when uploading', () => {
      element.uploading = true;
      element.required = false;
      expect(element._getValidity()).to.be.false;
    });

    test('returns true when not uploading and not required', () => {
      element.uploading = false;
      element.required = false;
      expect(element._getValidity()).to.be.true;
    });

    test('returns false when required and has no value', () => {
      element.uploading = false;
      element.required = true;
      element.value = null;
      expect(element._getValidity()).to.be.false;
    });

    test('returns true when required and has value', () => {
      element.uploading = false;
      element.required = true;
      element.value = { data: '/file.pdf' };
      expect(element._getValidity()).to.be.true;
    });
  });

  suite('_hasSingleValue', () => {
    test('returns true when not multiple and has value', () => {
      element.multiple = false;
      element.value = { data: '/file.pdf' };
      expect(element._hasSingleValue()).to.be.true;
    });

    test('returns false when multiple is true', () => {
      element.multiple = true;
      element.value = [{ data: '/file.pdf' }];
      expect(element._hasSingleValue()).to.be.false;
    });

    test('returns false when not multiple but no value', () => {
      element.multiple = false;
      element.value = null;
      expect(element._hasSingleValue()).to.be.false;
    });
  });

  suite('_isDropzoneVisible', () => {
    test('returns true when document is under retention and xpath is retained', () => {
      element.xpath = 'file:content';
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['file:content'],
      };
      expect(element._isDropzoneVisible(doc)).to.be.true;
    });

    test('returns readonly when under retention but xpath is not retained', () => {
      element.xpath = 'file:content';
      element.readonly = false;
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: ['files:files/0/file'],
      };
      expect(element._isDropzoneVisible(doc)).to.be.false;
    });

    test('falls through to readonly when retainedProperties is empty', () => {
      element.xpath = 'file:content';
      element.readonly = true;
      const doc = {
        isUnderRetentionOrLegalHold: true,
        retainedProperties: [],
      };
      expect(element._isDropzoneVisible(doc)).to.be.true;
    });

    test('returns readonly when document has no retention info', () => {
      element.readonly = true;
      expect(element._isDropzoneVisible({})).to.be.true;
    });

    test('returns false when document is null and not readonly', () => {
      element.readonly = false;
      expect(element._isDropzoneVisible(null)).to.be.false;
    });

    test('returns readonly value when isUnderRetentionOrLegalHold is false', () => {
      element.xpath = 'file:content';
      element.readonly = false;
      const doc = {
        isUnderRetentionOrLegalHold: false,
        retainedProperties: ['file:content'],
      };
      expect(element._isDropzoneVisible(doc)).to.be.false;
    });

    test('returns readonly when retainedProperties is missing', () => {
      element.readonly = true;
      const doc = { isUnderRetentionOrLegalHold: true };
      expect(element._isDropzoneVisible(doc)).to.be.true;
    });
  });

  suite('_hasValue', () => {
    test('returns true when multiple and value is non-empty array', () => {
      element.multiple = true;
      element.value = [{ data: '/file1.pdf' }];
      expect(element._hasValue()).to.be.true;
    });

    test('returns false when multiple and value is empty array', () => {
      element.multiple = true;
      element.value = [];
      expect(element._hasValue()).to.be.false;
    });

    test('returns false when multiple and value is null', () => {
      element.multiple = true;
      element.value = null;
      expect(element._hasValue()).to.be.false;
    });

    test('returns true when single and value is truthy', () => {
      element.multiple = false;
      element.value = { data: '/file.pdf' };
      expect(element._hasValue()).to.be.true;
    });

    test('returns false when single and value is null', () => {
      element.multiple = false;
      element.value = null;
      expect(element._hasValue()).to.be.false;
    });

    test('returns false when single and value is undefined', () => {
      element.multiple = false;
      element.value = undefined;
      expect(element._hasValue()).to.be.false;
    });
  });

  suite('_updateValue', () => {
    test('sets single value from files when multiple is false', () => {
      element.multiple = false;
      element.batchId = 'batch-123';
      element.files = [new window.File(['a'], 'single.txt', { type: 'text/plain' })];
      element._updateValue();
      expect(element.value).to.be.an('object');
      expect(element.value['upload-batch']).to.equal('batch-123');
      expect(element.value['upload-fileId']).to.equal('0');
      expect(element.value._name).to.equal('single.txt');
      expect(element.value._url).to.include('blob:');
    });

    test('pushes values to array when multiple is true', () => {
      element.multiple = true;
      element.value = [];
      element.batchId = 'batch-456';
      element.files = [
        new window.File(['a'], 'first.txt', { type: 'text/plain' }),
        new window.File(['b'], 'second.txt', { type: 'text/plain' }),
      ];
      element._updateValue();
      expect(element.value).to.be.an('array');
      expect(element.value).to.have.lengthOf(2);
      expect(element.value[0]._name).to.equal('first.txt');
      expect(element.value[0]['upload-fileId']).to.equal('0');
      expect(element.value[1]._name).to.equal('second.txt');
      expect(element.value[1]['upload-fileId']).to.equal('1');
    });

    test('initializes value to empty array when multiple and value is null', () => {
      element.multiple = true;
      element.value = null;
      element.batchId = 'batch-789';
      element.files = [new window.File(['x'], 'file.txt', { type: 'text/plain' })];
      element._updateValue();
      expect(element.value).to.be.an('array');
      expect(element.value).to.have.lengthOf(1);
    });

    test('initializes value to empty array when multiple and value is not an array', () => {
      element.multiple = true;
      element.value = 'invalid';
      element.batchId = 'batch-000';
      element.files = [new window.File(['y'], 'file2.txt', { type: 'text/plain' })];
      element._updateValue();
      expect(element.value).to.be.an('array');
      expect(element.value).to.have.lengthOf(1);
    });
  });

  suite('remove', () => {
    test('sets value to null for single mode', () => {
      element.multiple = false;
      element.value = { data: '/file.pdf' };
      element.remove({});
      expect(element.value).to.be.null;
      expect(element.files).to.be.null;
    });

    test('splices entry from array for multiple mode', () => {
      element.multiple = true;
      element.value = [
        { data: '/file1.pdf', _name: 'a.pdf' },
        { data: '/file2.pdf', _name: 'b.pdf' },
        { data: '/file3.pdf', _name: 'c.pdf' },
      ];
      element.remove({ model: { __data: { index: 1 } } });
      expect(element.value).to.have.lengthOf(2);
      expect(element.value[0]._name).to.equal('a.pdf');
      expect(element.value[1]._name).to.equal('c.pdf');
    });

    test('removes last entry from array for multiple mode', () => {
      element.multiple = true;
      element.value = [{ data: '/file1.pdf', _name: 'only.pdf' }];
      element.remove({ model: { __data: { index: 0 } } });
      expect(element.value).to.have.lengthOf(0);
    });
  });
});
