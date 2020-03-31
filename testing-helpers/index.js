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
export { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
export { focus, pressAndReleaseKeyOn, tap } from '@polymer/iron-test-helpers/mock-interactions';
export { default as fakeServer } from './nuxeo-mock-client.js';
export {
  flush,
  isElementVisible,
  login,
  timePasses,
  waitChanged,
  waitForAttrMutation,
  waitForChildListMutation,
  waitForEvent,
} from './test-helpers.js';
