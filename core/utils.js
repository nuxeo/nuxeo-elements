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
const joinPath = require('nuxeo/lib/deps/utils/join');
/**
 * Recursive method to create nested objects when they don't exist in a parent object.
 * It does not change any other existing objects or inner objects, only the ones referred in 'path'.
 * @param obj Parent Object where inner nested objects should be created.
 * @param path Array containing the inner object keys.
 * Usage Example:
 *
 *    const myObject = {}
 *    createNestedObject(myObject, ['first', 'second', 'third', 'fourth']);
 *
 * Returns:
 *
 *    myObject
 *    {
 *      first: {
 *          second: {
 *              third: {
 *                  fourth: {}
 *              }
 *          }
 *      }
 *    }
 *
 */
export function createNestedObject(obj, path) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('The param "obj" must be a JSON object');
  } else if (!Array.isArray(path)) {
    throw new TypeError('The param "path" must be an array');
  }

  if (path.length === 0) {
    return;
  }
  if ((!Object.prototype.hasOwnProperty.call(obj, path[0]) && !obj[path[0]]) || typeof obj[path[0]] !== 'object') {
    obj[path[0]] = {};
  }
  return createNestedObject(obj[path[0]], path.slice(1));
}
export { joinPath as join };
