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

Nuxeo = Nuxeo || {};
Nuxeo.UI = Nuxeo.UI || {};
Nuxeo.UI.config = Nuxeo.UI.config || {};
const { config } = Nuxeo.UI;

Object.assign(config, {
  /**
   * Returns a property for a given `path`. If it is not defined, `fallback` is returned instead.
   * If `fallback` is defined, the method will try to convert the property value to the same data type of `fallback`.
   */
  get(path, fallback) {
    let val = path.split('.').reduce((a, b) => a && a[b], this);
    if (val !== undefined && typeof val !== typeof fallback) {
      if (typeof fallback === 'boolean') {
        val = val === 'true';
      } else {
        let type;
        switch (typeof fallback) {
          case 'number':
            type = Number;
            break;
          case 'string':
            type = String;
            break;
          case 'bigint':
            // eslint-disable-next-line no-undef
            type = BigInt;
            break;
          default:
            break;
        }
        val = (type && type(val)) != null ? type(val) : val;
      }
    }
    return val != null ? val : fallback;
  },
  /**
   * Sets the `value` for property identified by a given `path`. All intermediate path segments will be created if they
   * don't exist already.
   */
  set(path, value) {
    const parentPath = path.substring(0, path.lastIndexOf('.'));
    let parent = this.get(parentPath);
    if (!parent) {
      parent = path
        .split('.')
        .slice(0, -1)
        .reduce((a, b) => {
          a[b] = a[b] || {};
          return a[b];
        }, this);
    }
    parent[path.substring(path.lastIndexOf('.') + 1)] = value;
  },
});

export default config;
