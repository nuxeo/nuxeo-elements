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

import '../nuxeo-element.js';
import config from '../config.js';

suite('config', () => {
  setup(() => {
    config.set('stringProperty', 'value');
    config.set('booleanProperty', true);
    config.set('numberProperty', 101);
    config.set('bigintProperty', 9007199254740991);
  });
  suite('properties without fallback values', () => {
    test('string property', () => expect(config.get('stringProperty')).to.equal('value'));
    test('boolean property', () => expect(config.get('booleanProperty')).to.be.true);
    test('number property', () => expect(config.get('numberProperty')).to.equal(101));
    test('bigint property', () => expect(config.get('bigintProperty')).to.equal(9007199254740991));
    test('non-existent property', () => expect(config.get('nonExistent')).to.be.undefined);
  });
  suite('properties with fallback values', () => {
    test('string property', () => expect(config.get('stringProperty', 'empty')).to.equal('value'));
    test('boolean property', () => expect(config.get('booleanProperty', false)).to.be.true);
    test('number property', () => expect(config.get('numberProperty', 102)).to.equal(101));
    test('bigint property', () => expect(config.get('bigintProperty', 9007199254740992)).to.equal(9007199254740991));

    test('non-existent string property', () =>
      expect(config.get('nonExistentStringProperty', 'value')).to.equal('value'));
    test('non-existent boolean property', () => expect(config.get('nonExistentBooleanProperty', true)).to.be.true);
    test('non-existent number property', () => expect(config.get('nonExistentNumberProperty', 101)).to.equal(101));
    test('non-existent bigint property', () =>
      expect(config.get('nonExistentBigIntProperty', 9007199254740992)).to.equal(9007199254740992));
  });
  suite('boolean properties with default values', () => {
    setup(() => {
      config.set('falseBooleanProperty', false);
      config.set('trueBooleanProperty', true);
      config.set('falseStringBooleanProperty', 'false');
      config.set('trueStringBooleanProperty', 'true');
    });
    test('non-existent false boolean property', () =>
      expect(config.get('nonExistentBooleanProperty', false)).to.be.false);
    test('non-existent true boolean property', () => expect(config.get('nonExistentBooleanProperty', true)).to.be.true);
    test('existent false boolean property', () => expect(config.get('falseBooleanProperty', false)).to.be.false);
    test('existent true boolean property', () => expect(config.get('trueBooleanProperty', false)).to.be.true);

    test('existent property with false string', () =>
      expect(config.get('falseStringBooleanProperty', false)).to.be.false);
    test('existent property with true string', () => expect(config.get('trueStringBooleanProperty', false)).to.be.true);

    test('existent string with false string', () =>
      expect(config.get('falseStringBooleanProperty', 'false')).to.equal('false'));
    test('existent string with true string', () =>
      expect(config.get('trueStringBooleanProperty', 'true')).to.equal('true'));
  });
});
