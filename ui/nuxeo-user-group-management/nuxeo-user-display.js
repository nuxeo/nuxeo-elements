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
 * Returns a human-readable display name for a user entity,
 * preferring firstName + lastName, falling back to username.
 */
export function formatUserDisplayName(user) {
  if (!user) return '';
  const props = user.properties || {};
  const first = props.firstName || props['user:firstName'] || '';
  const last = props.lastName || props['user:lastName'] || '';
  const full = [first, last].join(' ').trim();
  return full || props.username || props['user:username'] || user.id || user.name || '';
}

/**
 * Returns the principal identifier for a user entity (the login username),
 * suitable for ACL queries and entity bindings.
 */
export function formatUserPrincipal(user) {
  if (!user) return '';
  const props = user.properties || {};
  return props.username || props['user:username'] || user.id || user.name || '';
}

/**
 * Fetches user entities for a set of usernames using a nuxeo-resource element.
 * Returns a map of username → user entity (or raw username string on failure).
 */
export async function fetchUserEntities(usernames, resourceElement) {
  const entities = {};
  for (const username of usernames) {
    try {
      resourceElement.path = `/user/${username}`;
      const user = await resourceElement.get();
      entities[username] = user;
    } catch (error) {
      if (error.status && error.status !== 404) {
        console.warn(`Unexpected error resolving user "${username}":`, error.message);
      }
      entities[username] = username;
    }
  }
  return entities;
}

/**
 * Resolves a username to its entity from the entities map, falling back to raw username.
 */
export function resolveUser(username, entities) {
  if (!entities) return username;
  return entities[username] || username;
}
