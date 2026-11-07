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
 * Principals the platform creates internally and never stores in the user directory.
 * Resolving one via /user/<name> always 404s and makes the server log a warning for
 * every call, which floods server.log (WEBUI-2309), so we never ask the server for them.
 */
const INTERNAL_PRINCIPALS = new Set(['system']);

/**
 * Returns true when the principal is internal to the platform and therefore has no
 * user directory entry to resolve.
 */
export function isInternalPrincipal(username) {
  return INTERNAL_PRINCIPALS.has(username);
}

/**
 * Tracks the in-flight fetch chain for each shared resource element so that
 * concurrent callers are serialized rather than racing on the same element.
 */
const resourceQueues = new WeakMap();

/**
 * Resolves a single username to its user entity, falling back to the raw username
 * when the server cannot resolve it.
 */
async function resolveUserEntity(username, resourceElement) {
  if (isInternalPrincipal(username)) {
    // Never resolvable: skip the request entirely and display the raw name.
    return username;
  }
  try {
    resourceElement.path = `/user/${encodeURIComponent(username)}`;
    return await resourceElement.get();
  } catch (error) {
    if (error.status !== 404) {
      console.warn(`Unexpected error resolving user "${username}":`, error);
    }
    return username;
  }
}

/**
 * Resolves a set of usernames to user entities by mutating and querying the shared
 * nuxeo-resource element one username at a time. The lookups are chained rather than
 * run in parallel because the element aborts an in-flight request when its path changes.
 * Returns a map of username → user entity (or raw username string on failure).
 */
function resolveUserEntities(usernames, resourceElement) {
  return Array.from(usernames).reduce(
    (chain, username) =>
      chain.then((entities) =>
        resolveUserEntity(username, resourceElement).then((entity) => {
          entities[username] = entity;
          return entities;
        }),
      ),
    Promise.resolve({}),
  );
}

/**
 * Fetches user entities for a set of usernames using a nuxeo-resource element.
 * Returns a map of username → user entity (or raw username string on failure).
 *
 * Because `nuxeo-resource` mutates a shared `path` and aborts in-flight
 * requests when a new one starts, concurrent callers using the same resource
 * element would abort each other's requests. Invocations are therefore
 * serialized per resource element via a promise chain.
 */
export function fetchUserEntities(usernames, resourceElement) {
  const previous = resourceQueues.get(resourceElement) || Promise.resolve();
  const run = previous.catch(() => {}).then(() => resolveUserEntities(usernames, resourceElement));
  resourceQueues.set(resourceElement, run);
  return run;
}

/**
 * Resolves a username to its entity from the entities map, falling back to raw username.
 */
export function resolveUser(username, entities) {
  if (!entities) return username;
  return entities[username] || username;
}
