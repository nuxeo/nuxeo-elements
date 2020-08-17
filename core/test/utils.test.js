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
import { createNestedObject } from '../utils.js';

suite('utils', () => {
  suite('"createNestedObject" function', () => {
    suite('Parameters Validation', () => {
      test('Should throw an exception when no object or path are provided', () => {
        expect(() => createNestedObject(null, null)).to.throw(TypeError, 'The param "obj" must be a JSON object');
      });

      test('Should throw an exception when no path is provided', () => {
        expect(() => createNestedObject({}, null)).to.throw(TypeError, 'The param "path" must be an array');
      });

      test('Should throw an exception when a type different than object is provided as parameter', () => {
        expect(() => createNestedObject('a string', ['first', 'second'])).to.throw(
          TypeError,
          'The param "obj" must be a JSON object',
        );
      });
    });

    suite('Creation Validation', () => {
      test('Should return same object when an empty array is provided', () => {
        const obj = {};
        createNestedObject(obj, []);
        expect(obj).to.deep.equal({});
      });

      test('Should create object entries when an object and an array containing path levels are provided', () => {
        const obj = {};
        createNestedObject(obj, ['first', 'second', 'third', 'fourth']);
        expect(obj).to.deep.equal({ first: { second: { third: { fourth: {} } } } });
      });

      test("Should replace existing keys when they don't represent and object", () => {
        const obj = { first: { second: 'end' } };
        createNestedObject(obj, ['first', 'second', 'third', 'fourth']);
        expect(obj).to.deep.equal({ first: { second: { third: { fourth: {} } } } });
      });

      test('Should create an object with not object fields', () => {
        const obj = { prop1: null, prop2: 'value' };
        createNestedObject(obj, ['prop1']);
        expect(obj).to.deep.equal({ prop1: null, prop2: 'value' });
      });
    });
  });
});
