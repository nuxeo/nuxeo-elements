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

/**
 * `Nuxeo.SortBehavior` provides shared helpers for multi-column sorting on user/group management tables.
 *
 * Mirrors the sort-direction contract used by `nuxeo-data-table-column-sort`:
 * each column is described by `{ path, direction }` where `direction` is `'asc'`, `'desc'`, or `null` (remove).
 *
 * @polymerBehavior
 */
export const SortBehavior = {
  /**
   * Applies a sort-direction change to an array of `{ path, direction }` column descriptors.
   * - If the column already exists and `direction` is truthy, update it.
   * - If the column already exists and `direction` is falsy (`null`), remove it.
   * - If the column does not exist and `direction` is truthy, append it.
   *
   * @param {Array<{path: string, direction: string}>} sortOrder current sort columns
   * @param {string} path column path that changed
   * @param {string|null} direction new direction or `null` to remove
   * @return {Array<{path: string, direction: string}>} updated sort columns (new array)
   */
  _applySortDirectionChanged(sortOrder, path, direction) {
    const result = sortOrder.slice();
    const idx = result.findIndex((c) => c.path === path);
    if (idx >= 0) {
      if (direction) {
        result[idx] = { path, direction };
      } else {
        result.splice(idx, 1);
      }
    } else if (direction) {
      result.push({ path, direction });
    }
    return result;
  },

  /**
   * Returns `true` when the given `path` is among the active sort columns.
   */
  _isSortActive(sortOrder, path) {
    return sortOrder && sortOrder.some((c) => c.path === path);
  },

  /**
   * Returns an `aria-sort` value (`'ascending'`, `'descending'`, or `'none'`) for the given column path.
   */
  _ariaSort(sortOrder, path) {
    const col = sortOrder && sortOrder.find((c) => c.path === path);
    if (!col) {
      return 'none';
    }
    return col.direction === 'asc' ? 'ascending' : 'descending';
  },
};

Nuxeo.SortBehavior = SortBehavior;
