/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import '../nuxeo-document-permissions/nuxeo-document-permissions.js';

suite('nuxeo-document-permissions extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-document-permissions></nuxeo-document-permissions>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.DocumentPermissions.is).to.equal('nuxeo-document-permissions');
  });

  test('should have default property values', () => {
    expect(Nuxeo.DocumentPermissions.properties.doc.value).to.equal(null);
    expect(Nuxeo.DocumentPermissions.properties.docId.value).to.equal('');
    expect(Nuxeo.DocumentPermissions.properties.docPath.value).to.equal('');
    expect(Nuxeo.DocumentPermissions.properties.visible.value).to.be.false;
    expect(Nuxeo.DocumentPermissions.properties.showExternalPermissions.value).to.be.false;
  });

  test('connectedCallback sets dir attribute', () => {
    expect(el.hasAttribute('dir')).to.be.true;
  });

  suite('_hasPermission', () => {
    test('returns truthy when doc has WriteSecurity permission', () => {
      el.doc = { contextParameters: { permissions: ['Read', 'WriteSecurity'] } };
      expect(el._hasPermission()).to.be.ok;
    });

    test('returns falsy when doc has no WriteSecurity', () => {
      el.doc = { contextParameters: { permissions: ['Read'] } };
      expect(el._hasPermission()).to.not.be.ok;
    });

    test('returns falsy when doc lacks permissions array', () => {
      el.doc = { contextParameters: {} };
      expect(el._hasPermission()).to.not.be.ok;
    });

    test('returns falsy when doc is null', () => {
      el.doc = null;
      expect(el._hasPermission()).to.not.be.ok;
    });
  });

  suite('_empty', () => {
    test('returns true for empty arrays', () => {
      expect(el._empty([])).to.be.true;
    });

    test('returns false for non-empty arrays', () => {
      expect(el._empty([1])).to.be.false;
    });
  });

  suite('ACL filters', () => {
    test('_excludeInheritedAcls returns true for non-inherited acls', () => {
      expect(el._excludeInheritedAcls({ name: 'local' })).to.be.true;
    });

    test('_excludeInheritedAcls returns false for inherited acls', () => {
      expect(el._excludeInheritedAcls({ name: 'inherited' })).to.be.false;
    });

    test('_onlyInheritedAcls returns true for inherited acls', () => {
      expect(el._onlyInheritedAcls({ name: 'inherited' })).to.be.true;
    });

    test('_onlyInheritedAcls returns false for other acls', () => {
      expect(el._onlyInheritedAcls({ name: 'local' })).to.be.false;
    });
  });

  suite('ACE filters', () => {
    test('_excludeExternalUserAces returns true for internal granted ace', () => {
      const ace = { granted: true, status: 'effective', externalUser: false };
      expect(el._excludeExternalUserAces(ace)).to.be.true;
    });

    test('_excludeExternalUserAces returns false when externalUser is true', () => {
      const ace = { granted: true, status: 'effective', externalUser: true };
      expect(el._excludeExternalUserAces(ace)).to.be.false;
    });

    test('_excludeExternalUserAces returns false for non-granted ace', () => {
      const ace = { granted: false, status: 'effective', externalUser: false };
      expect(el._excludeExternalUserAces(ace)).to.be.false;
    });

    test('_excludeExternalUserAces respects status pending', () => {
      const ace = { granted: true, status: 'pending', externalUser: false };
      expect(el._excludeExternalUserAces(ace)).to.be.true;
    });

    test('_onlyExternalUserAces returns true for granted external ace', () => {
      const ace = { granted: true, status: 'effective', externalUser: true };
      expect(el._onlyExternalUserAces(ace)).to.be.true;
    });

    test('_onlyExternalUserAces returns false for internal ace', () => {
      const ace = { granted: true, status: 'effective', externalUser: false };
      expect(el._onlyExternalUserAces(ace)).to.be.false;
    });
  });

  suite('_emptyLabel', () => {
    test('returns loading label when loading is true', () => {
      const label = el._emptyLabel('documentPermissions.noLocalPermissions', true, el.i18n);
      expect(label).to.be.a('string');
    });

    test('returns the label when not loading', () => {
      const label = el._emptyLabel('documentPermissions.noLocalPermissions', false, el.i18n);
      expect(label).to.be.a('string');
    });
  });

  suite('notification handlers', () => {
    test('onACECreated shows a toast and refreshes', () => {
      const refreshSpy = sinon.spy(el, 'refresh');
      const showSpy = sinon.spy(el.$.toast, 'show');
      el.onACECreated();
      expect(el.$.toast.text).to.be.a('string');
      expect(showSpy).to.have.been.called;
      expect(refreshSpy).to.have.been.called;
      refreshSpy.restore();
      showSpy.restore();
    });

    test('onACEUpdated shows a toast and refreshes', () => {
      const refreshSpy = sinon.spy(el, 'refresh');
      el.onACEUpdated();
      expect(el.$.toast.text).to.be.a('string');
      expect(refreshSpy).to.have.been.called;
      refreshSpy.restore();
    });

    test('onACEDeleted shows a toast and refreshes', () => {
      const refreshSpy = sinon.spy(el, 'refresh');
      el.onACEDeleted();
      expect(el.$.toast.text).to.be.a('string');
      expect(refreshSpy).to.have.been.called;
      refreshSpy.restore();
    });

    test('onNotification updates toast text', () => {
      el.onNotification();
      expect(el.$.toast.text).to.be.a('string');
    });
  });

  suite('refresh', () => {
    test('does nothing when not visible', () => {
      const spy = sinon.spy(el.$.doc, 'get');
      el.visible = false;
      el.refresh();
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('refreshes the document when visible', async () => {
      el.visible = true;
      el.$.doc.get = sinon.stub().returns(Promise.resolve({}));
      el.refresh();
      expect(el.$.doc.get).to.have.been.called;
    });
  });

  suite('blockInheritance / unblockInheritance', () => {
    test('blockInheritance executes operation', () => {
      const opSpy = sinon.stub(el.$.blockOp, 'execute').returns(Promise.resolve());
      el.blockInheritance();
      expect(opSpy).to.have.been.called;
      opSpy.restore();
    });

    test('unblockInheritance executes operation', () => {
      const opSpy = sinon.stub(el.$.unblockOp, 'execute').returns(Promise.resolve());
      el.unblockInheritance();
      expect(opSpy).to.have.been.called;
      opSpy.restore();
    });
  });

  suite('inheritance action aria labels', () => {
    setup(() => {
      el.doc = { uid: 'doc-1', contextParameters: { permissions: ['Read', 'WriteSecurity'] } };
    });

    test('block button exposes the full aria label including the section name', () => {
      el.inheritedAces = [{ id: 'ace-1' }];
      flush();
      const blockButton = el.shadowRoot.querySelector('#block');
      expect(blockButton).to.exist;
      expect(blockButton.getAttribute('aria-label')).to.equal(
        el.i18n('documentPermissions.block.ariaLabel'),
      );
      expect(blockButton.getAttribute('aria-label')).to.equal(
        'Block permissions for inherited from upper levels button',
      );
    });

    test('unblock button exposes the full aria label including the section name', () => {
      el.inheritedAces = [];
      flush();
      const unblockButton = el.shadowRoot.querySelector('#unblock');
      expect(unblockButton).to.exist;
      expect(unblockButton.getAttribute('aria-label')).to.equal(
        el.i18n('documentPermissions.unblock.ariaLabel'),
      );
      expect(unblockButton.getAttribute('aria-label')).to.equal(
        'Unblock permissions for inherited from upper levels button',
      );
    });
  });
});
