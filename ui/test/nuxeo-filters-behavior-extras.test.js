/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';

const fb = FiltersBehavior;

suite('Nuxeo.FiltersBehavior extras', () => {
  suite('isFavorite', () => {
    test('returns truthy when isFavorite is true', () => {
      const doc = { contextParameters: { favorites: { isFavorite: true } } };
      expect(fb.isFavorite(doc)).to.be.ok;
    });

    test('returns falsy when isFavorite is false', () => {
      const doc = { contextParameters: { favorites: { isFavorite: false } } };
      expect(fb.isFavorite(doc)).to.not.be.ok;
    });

    test('returns falsy when favorites is missing', () => {
      expect(fb.isFavorite({ contextParameters: {} })).to.not.be.ok;
    });

    test('returns falsy for null doc', () => {
      expect(fb.isFavorite(null)).to.not.be.ok;
    });

    test('returns falsy when contextParameters missing', () => {
      expect(fb.isFavorite({})).to.not.be.ok;
    });
  });

  suite('isSubscribed', () => {
    test('returns truthy when subscribed', () => {
      const doc = { contextParameters: { subscribedNotifications: ['email'] } };
      expect(fb.isSubscribed(doc)).to.be.ok;
    });

    test('returns falsy when not subscribed', () => {
      const doc = { contextParameters: { subscribedNotifications: [] } };
      expect(fb.isSubscribed(doc)).to.not.be.ok;
    });

    test('returns falsy when missing', () => {
      expect(fb.isSubscribed({ contextParameters: {} })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.isSubscribed(null)).to.not.be.ok;
    });
  });

  suite('isCollectionMember', () => {
    test('returns true when NotCollectionMember not in facets', () => {
      expect(fb.isCollectionMember({ facets: ['Folderish'] })).to.be.true;
    });

    test('returns false when NotCollectionMember in facets', () => {
      expect(fb.isCollectionMember({ facets: ['NotCollectionMember'] })).to.be.false;
    });

    test('returns false when facets missing', () => {
      expect(fb.isCollectionMember({})).to.be.false;
    });

    test('returns false for null', () => {
      expect(fb.isCollectionMember(null)).to.be.false;
    });
  });

  suite('isTrashed', () => {
    test('returns true when isTrashed is true', () => {
      expect(fb.isTrashed({ isTrashed: true })).to.be.true;
    });

    test('returns false when isTrashed is false', () => {
      expect(fb.isTrashed({ isTrashed: false })).to.be.false;
    });

    test('falls back to hasState when isTrashed is undefined', () => {
      const ctx = {
        ...fb,
        hasState: (doc, state) => doc.state === state,
      };
      expect(ctx.isTrashed({ state: 'deleted' })).to.be.true;
      expect(ctx.isTrashed({ state: 'project' })).to.be.false;
    });

    test('returns false for null', () => {
      expect(fb.isTrashed(null)).to.be.false;
    });

    test('returns false for undefined', () => {
      expect(fb.isTrashed(undefined)).to.be.false;
    });
  });

  suite('isVersion', () => {
    test('returns true for version', () => {
      expect(fb.isVersion({ isVersion: true })).to.be.true;
    });

    test('returns false for non-version', () => {
      expect(fb.isVersion({ isVersion: false })).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.isVersion(null)).to.not.be.ok;
    });
  });

  suite('isUnderRetentionOrLegalHold', () => {
    test('returns true when under retention', () => {
      expect(fb.isUnderRetentionOrLegalHold({ isUnderRetentionOrLegalHold: true })).to.be.true;
    });

    test('returns false when not under retention', () => {
      expect(fb.isUnderRetentionOrLegalHold({ isUnderRetentionOrLegalHold: false })).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.isUnderRetentionOrLegalHold(null)).to.not.be.ok;
    });
  });

  suite('isRecord', () => {
    test('returns true for record', () => {
      expect(fb.isRecord({ isRecord: true })).to.be.true;
    });

    test('returns falsy when not record', () => {
      expect(fb.isRecord({ isRecord: false })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.isRecord(null)).to.not.be.ok;
    });
  });

  suite('hasType', () => {
    test('returns true when type matches', () => {
      expect(fb.hasType({ type: 'File' }, 'File')).to.be.true;
    });

    test('returns false when type does not match', () => {
      expect(fb.hasType({ type: 'File' }, 'Note')).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.hasType(null, 'File')).to.not.be.ok;
    });
  });

  suite('isProxy', () => {
    test('returns true for proxy', () => {
      expect(fb.isProxy({ isProxy: true })).to.be.true;
    });

    test('returns falsy for non-proxy', () => {
      expect(fb.isProxy({ isProxy: false })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.isProxy(null)).to.not.be.ok;
    });
  });

  suite('pathMatches', () => {
    test('returns true when path matches regex', () => {
      expect(fb.pathMatches({ path: '/default-domain/ws' }, '^/default')).to.be.true;
    });

    test('returns false when path does not match', () => {
      expect(fb.pathMatches({ path: '/other/path' }, '^/default')).to.be.false;
    });

    test('returns falsy when path is missing', () => {
      expect(fb.pathMatches({}, '^/default')).to.not.be.ok;
    });

    test('returns falsy for null doc', () => {
      expect(fb.pathMatches(null, '^/a')).to.not.be.ok;
    });
  });

  suite('hasState', () => {
    test('returns true when state matches', () => {
      expect(fb.hasState({ state: 'project' }, 'project')).to.be.true;
    });

    test('returns false when state does not match', () => {
      expect(fb.hasState({ state: 'project' }, 'deleted')).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.hasState(null, 'project')).to.not.be.ok;
    });
  });

  suite('hasFacet', () => {
    test('returns true when facet exists', () => {
      expect(fb.hasFacet({ facets: ['Folderish'] }, 'Folderish')).to.be.true;
    });

    test('returns false when facet is missing', () => {
      expect(fb.hasFacet({ facets: ['Folderish'] }, 'Versionable')).to.be.false;
    });

    test('returns falsy when facets array is missing', () => {
      expect(fb.hasFacet({}, 'Folderish')).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasFacet(null, 'X')).to.not.be.ok;
    });
  });

  suite('hasPermission', () => {
    test('returns true when permission exists', () => {
      const doc = { contextParameters: { permissions: ['Write', 'Read'] } };
      expect(fb.hasPermission(doc, 'Write')).to.be.true;
    });

    test('returns false when permission is missing', () => {
      const doc = { contextParameters: { permissions: ['Read'] } };
      expect(fb.hasPermission(doc, 'Write')).to.be.false;
    });

    test('returns falsy when permissions is missing', () => {
      expect(fb.hasPermission({ contextParameters: {} }, 'Write')).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasPermission(null, 'Write')).to.not.be.ok;
    });
  });

  suite('hasContent', () => {
    test('returns truthy when file:content exists', () => {
      const ctx = { ...fb, get: (xpath, props) => props[xpath] };
      const doc = { properties: { 'file:content': { data: 'x' } } };
      expect(ctx.hasContent(doc)).to.be.ok;
    });

    test('returns false when no properties', () => {
      const ctx = { ...fb, get: () => null };
      expect(ctx.hasContent({})).to.be.false;
    });

    test('returns false for null doc', () => {
      const ctx = { ...fb, get: () => null };
      expect(ctx.hasContent(null)).to.be.false;
    });

    test('uses custom xpath', () => {
      const ctx = { ...fb, get: (xpath) => (xpath === 'custom:blob' ? 'data' : null) };
      const doc = { properties: {} };
      expect(ctx.hasContent(doc, 'custom:blob')).to.equal('data');
    });
  });

  suite('hasAttachments', () => {
    test('returns true when files:files has items', () => {
      const doc = { properties: { 'files:files': [{ file: {} }] } };
      expect(fb.hasAttachments(doc)).to.be.true;
    });

    test('returns false when files:files is empty', () => {
      const doc = { properties: { 'files:files': [] } };
      expect(fb.hasAttachments(doc)).to.not.be.ok;
    });

    test('returns falsy when properties missing', () => {
      expect(fb.hasAttachments({})).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasAttachments(null)).to.not.be.ok;
    });
  });

  suite('hasVersions', () => {
    test('returns true when major version > 0', () => {
      const doc = { properties: { 'uid:major_version': 1, 'uid:minor_version': 0 } };
      expect(fb.hasVersions(doc)).to.be.true;
    });

    test('returns true when minor version > 0', () => {
      const doc = { properties: { 'uid:major_version': 0, 'uid:minor_version': 1 } };
      expect(fb.hasVersions(doc)).to.be.true;
    });

    test('returns false when both are 0', () => {
      const doc = { properties: { 'uid:major_version': 0, 'uid:minor_version': 0 } };
      expect(fb.hasVersions(doc)).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.hasVersions(null)).to.not.be.ok;
    });
  });

  suite('hasCollections', () => {
    test('returns true when collections exist', () => {
      const doc = { contextParameters: { collections: ['c1'] } };
      expect(fb.hasCollections(doc)).to.be.ok;
    });

    test('returns falsy when collections empty', () => {
      const doc = { contextParameters: { collections: [] } };
      expect(fb.hasCollections(doc)).to.not.be.ok;
    });

    test('returns falsy when missing', () => {
      expect(fb.hasCollections({ contextParameters: {} })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasCollections(null)).to.not.be.ok;
    });
  });

  suite('hasSchema', () => {
    test('returns true when schema name matches', () => {
      const doc = { schemas: [{ name: 'dublincore', prefix: 'dc' }] };
      expect(fb.hasSchema(doc, 'dublincore')).to.be.true;
    });

    test('returns true when schema prefix matches', () => {
      const doc = { schemas: [{ name: 'dublincore', prefix: 'dc' }] };
      expect(fb.hasSchema(doc, 'dc')).to.be.true;
    });

    test('returns false when schema not found', () => {
      const doc = { schemas: [{ name: 'dublincore', prefix: 'dc' }] };
      expect(fb.hasSchema(doc, 'file')).to.be.false;
    });

    test('returns falsy when schemas missing', () => {
      expect(fb.hasSchema({}, 'dc')).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasSchema(null, 'dc')).to.not.be.ok;
    });
  });

  suite('isMember', () => {
    test('returns truthy when member of group', () => {
      const user = { extendedGroups: [{ name: 'admins' }] };
      expect(fb.isMember(user, 'admins')).to.be.ok;
    });

    test('returns falsy when not member', () => {
      const user = { extendedGroups: [{ name: 'members' }] };
      expect(fb.isMember(user, 'admins')).to.not.be.ok;
    });

    test('returns falsy when no extendedGroups', () => {
      expect(fb.isMember({}, 'admins')).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.isMember(null, 'admins')).to.not.be.ok;
    });
  });

  suite('hasAdministrationPermissions', () => {
    test('returns true for admin', () => {
      expect(fb.hasAdministrationPermissions({ isAdministrator: true })).to.be.true;
    });

    test('returns truthy for poweruser', () => {
      const ctx = { ...fb };
      const user = { extendedGroups: [{ name: 'powerusers' }] };
      expect(ctx.hasAdministrationPermissions(user)).to.be.ok;
    });

    test('returns falsy for regular user', () => {
      const ctx = { ...fb };
      const user = { isAdministrator: false, extendedGroups: [{ name: 'members' }] };
      expect(ctx.hasAdministrationPermissions(user)).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(fb.hasAdministrationPermissions(null)).to.not.be.ok;
    });
  });

  suite('hasRunningWorkflows', () => {
    test('returns true when running workflows exist', () => {
      const doc = { contextParameters: { runningWorkflows: [{ id: 'w1' }] } };
      expect(fb.hasRunningWorkflows(doc)).to.be.true;
    });

    test('returns false when empty', () => {
      const doc = { contextParameters: { runningWorkflows: [] } };
      expect(fb.hasRunningWorkflows(doc)).to.not.be.ok;
    });

    test('returns false when missing', () => {
      expect(fb.hasRunningWorkflows({ contextParameters: {} })).to.not.be.ok;
    });

    test('returns false for null', () => {
      expect(fb.hasRunningWorkflows(null)).to.be.false;
    });

    test('returns false when contextParameters missing', () => {
      expect(fb.hasRunningWorkflows({})).to.be.false;
    });
  });

  suite('hasRunnableWorkflows', () => {
    test('returns true when runnable workflows exist', () => {
      const doc = { contextParameters: { runnableWorkflows: [{ id: 'w1' }] } };
      expect(fb.hasRunnableWorkflows(doc)).to.be.true;
    });

    test('returns false when empty', () => {
      const doc = { contextParameters: { runnableWorkflows: [] } };
      expect(fb.hasRunnableWorkflows(doc)).to.not.be.ok;
    });

    test('returns false for null', () => {
      expect(fb.hasRunnableWorkflows(null)).to.be.false;
    });

    test('returns false when contextParameters missing', () => {
      expect(fb.hasRunnableWorkflows({})).to.be.false;
    });
  });

  suite('isRetentionDateIndeterminate', () => {
    test('returns true for 9999 date', () => {
      const doc = { retainUntil: '9999-01-01T00:00:00.000+00:00' };
      expect(fb.isRetentionDateIndeterminate(doc)).to.be.true;
    });

    test('returns false for normal date', () => {
      const doc = { retainUntil: '2025-01-01T00:00:00.000+00:00' };
      expect(fb.isRetentionDateIndeterminate(doc)).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(fb.isRetentionDateIndeterminate(null)).to.not.be.ok;
    });

    test('returns falsy when retainUntil missing', () => {
      expect(fb.isRetentionDateIndeterminate({})).to.not.be.ok;
    });
  });

  suite('pathStartsWith', () => {
    test('returns true when path starts with given string', () => {
      const doc = { path: '/default-domain/workspaces/ws1' };
      expect(fb.pathStartsWith(doc, '/default-domain')).to.be.true;
    });

    test('returns false when path does not start with given string', () => {
      const doc = { path: '/other/path' };
      expect(fb.pathStartsWith(doc, '/default')).to.be.false;
    });
  });

  suite('isImmutable', () => {
    test('delegates to hasFacet with "Immutable"', () => {
      const doc = { facets: ['Immutable'] };
      expect(fb.isImmutable(doc)).to.be.true;
    });

    test('returns false when not immutable', () => {
      const doc = { facets: ['Folderish'] };
      expect(fb.isImmutable(doc)).to.be.false;
    });
  });
});
