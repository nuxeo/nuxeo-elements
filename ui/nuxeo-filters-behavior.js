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

/**
 * `Nuxeo.FilterBehavior` provides a set of helpers to use in filter expressions.
 *
 * @polymerBehavior
 */
export const FiltersBehavior = {

  /**
   * Checks if the document is a favorite.
   */
  isFavorite(doc) {
    return doc && doc.contextParameters && doc.contextParameters.favorites &&
      doc.contextParameters.favorites.isFavorite;
  },

  /**
   * Checks if the current user is subscribed to document notifications.
   */
  isSubscribed(doc) {
    return doc && doc.contextParameters && doc.contextParameters.subscribedNotifications &&
      doc.contextParameters.subscribedNotifications.length > 0;
  },

  /**
   * Checks if the document can be added to a collection.
   */
  isCollectionMember(doc) {
    return (doc && doc.facets) ? doc.facets.indexOf('NotCollectionMember') === -1 : false;
  },

  /**
   * Checks if the document is trashed.
   */
  isTrashed(doc) {
    if (doc) {
      if (typeof doc.isTrashed === 'undefined') {
        return this.hasState(doc, 'deleted');
      } else {
        return doc.isTrashed;
      }
    }
    return false;
  },

  /**
   * Checks if the document is a version.
   */
  isVersion(doc) {
    return doc && doc.isVersion;
  },

  /**
   * Checks if the document is immutable.
   */
  isImmutable(doc) {
    return this.hasFacet(doc, 'Immutable');
  },

  /**
   * Checks the document's type.
   */
  hasType(doc, type) {
    return doc && doc.type === type;
  },

  /**
   * Checks if the document is a proxy.
   */
  isProxy(doc) {
    return doc && doc.isProxy;
  },

  /**
   * Checks if the document's path matches the given string regexp.
   */
  pathMatches(doc, regex) {
    return doc && doc.path && new RegExp(regex).test(doc.path);
  },

  /**
   * Checks if the document's path starts with the given path.
   */
  pathStartsWith(doc, path) {
    return this.pathMatches(doc, `^${path}`);
  },

  /**
   * Checks the document's life cycle state..
   */
  hasState(doc, state) {
    return doc && doc.state === state;
  },


  /**
   * Checks if the document has the given facet.
   */
  hasFacet(doc, facet) {
    return doc && doc.facets && doc.facets.indexOf(facet) !== -1;
  },

  /**
   * Checks if the document has the given permission.
   */
  hasPermission(doc, permission) {
    return doc && doc.contextParameters && doc.contextParameters.permissions &&
        doc.contextParameters.permissions.indexOf(permission) !== -1;
  },

  /**
   * Checks if the document has a main blob.
   */
  hasContent(doc, xpath) {
    return (doc && doc.properties) ? this.get(xpath || 'file:content', doc.properties) : false;
  },

  /**
   * Checks if the document has attachments.
   */
  hasAttachments(doc) {
    return doc && doc.properties && doc.properties['files:files'] && doc.properties['files:files'].length > 0;
  },

  /**
   * Checks if the document has attachments.
   */
  hasVersions(doc) {
    return doc && (doc.properties['uid:major_version'] > 0 || doc.properties['uid:minor_version'] > 0);
  },

  /**
   * Checks if the document belongs to a collection.
   */
  hasCollections(doc) {
    return doc && doc.contextParameters && doc.contextParameters.collections &&
        doc.contextParameters.collections.length > 0;
  },

  /**
   * Checks if given user is member of the group.
   */
  isMember(user, group) {
    return user && user.extendedGroups && user.extendedGroups.find((grp) => grp.name === group);
  },

  /**
   * Checks if the document can be published.
   */
  isPublishable(doc) {
    return doc && !this.isProxy(doc)
        && !this.isTrashed(doc)
        && this.hasFacet(doc, 'Publishable')
        && this.hasPermission(doc, 'Write');
  },

  /**
   * Checks if the document is a publication.
   */
  isPublication(doc) {
    return doc && this.isProxy(doc)
        && this.hasFacet(doc, 'Immutable');
  },

  /**
   * Checks if the document can be tagged.
   */
  isTaggable(doc) {
    return !this.isProxy(doc)
      && !doc.isVersion
      && this.hasPermission(doc, 'Write');
  },

};
