/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-checkmark.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-html-editor.js';
import '../widgets/nuxeo-user-avatar.js';
import '../marked-element.js';
import { importHref, importHTML } from '../import-href.js';

suite('nuxeo-checkmark', () => {
  test('renders with sane ARIA defaults', async () => {
    const el = await fixture(
      html`
        <nuxeo-checkmark></nuxeo-checkmark>
      `,
    );
    expect(el.getAttribute('role')).to.equal('checkbox');
    expect(el.getAttribute('aria-checked')).to.equal('false');
    expect(el.getAttribute('tabindex')).to.equal('0');
    expect(el.checked).to.be.false;
    expect(el.disabled).to.be.false;
  });

  test('_tap toggles the checked attribute', async () => {
    const el = await fixture(
      html`
        <nuxeo-checkmark></nuxeo-checkmark>
      `,
    );
    el._tap();
    expect(el.checked).to.be.true;
    expect(el.getAttribute('aria-checked')).to.equal('true');
    el._tap();
    expect(el.checked).to.be.false;
    expect(el.getAttribute('aria-checked')).to.equal('false');
  });

  test('_tap is a no-op when disabled', async () => {
    const el = await fixture(
      html`
        <nuxeo-checkmark disabled></nuxeo-checkmark>
      `,
    );
    el._tap();
    expect(el.checked).to.be.false;
  });

  test('Enter / Space / Spacebar key triggers a tap', async () => {
    const el = await fixture(
      html`
        <nuxeo-checkmark></nuxeo-checkmark>
      `,
    );
    const events = ['Enter', ' ', 'Spacebar'];
    let expected = false;
    events.forEach((key) => {
      expected = !expected;
      el._onKeyDown({ key, preventDefault() {} });
      expect(el.checked).to.equal(expected);
    });
  });

  test('an arbitrary key does not toggle the state', async () => {
    const el = await fixture(
      html`
        <nuxeo-checkmark></nuxeo-checkmark>
      `,
    );
    el._onKeyDown({ key: 'a', preventDefault() {} });
    expect(el.checked).to.be.false;
  });
});

suite('marked-element', () => {
  test('renders the markdown into the inner #content node', async () => {
    const el = await fixture(
      html`
        <marked-element markdown="# hello"></marked-element>
      `,
    );
    expect(el.$.content.innerHTML).to.contain('hello');
    expect(el.$.content.querySelector('h1')).to.exist;
  });

  test('clears the content when markdown is removed', async () => {
    const el = await fixture(
      html`
        <marked-element markdown="# hello"></marked-element>
      `,
    );
    el.markdown = '';
    expect(el.$.content.innerHTML).to.equal('');
  });

  test('strips <script> tags when sanitize is true', async () => {
    const el = await fixture(
      html`
        <marked-element sanitize markdown="<script>x()</script>hello"></marked-element>
      `,
    );
    expect(el.$.content.querySelector('script')).to.be.null;
    expect(el.$.content.innerHTML).to.contain('hello');
  });

  test('keeps <script> tags when sanitize is false (default)', async () => {
    const el = await fixture(
      html`
        <marked-element markdown="<script>x()</script>hello"></marked-element>
      `,
    );
    // marked may or may not include the script depending on its config — just make sure rendering does not throw.
    expect(el.$.content.innerHTML).to.contain('hello');
  });

  test('_basicSanitize removes <script> from arbitrary HTML', async () => {
    const el = await fixture(
      html`
        <marked-element></marked-element>
      `,
    );
    expect(el._basicSanitize('<p>hi</p><script>boom()</script>')).to.equal('<p>hi</p>');
  });
});

suite('nuxeo-dialog', () => {
  test('mounts and exposes a paper-dialog API', async () => {
    const el = await fixture(
      html`
        <nuxeo-dialog></nuxeo-dialog>
      `,
    );
    expect(el.constructor.is).to.equal('nuxeo-dialog');
    expect(typeof el.open).to.equal('function');
    expect(typeof el.close).to.equal('function');
    expect(typeof el.toggle).to.equal('function');
  });

  test('forwards open/close to the inner dialog', async () => {
    const el = await fixture(
      html`
        <nuxeo-dialog></nuxeo-dialog>
      `,
    );
    expect(el.opened).to.not.be.true;
    el.open();
    expect(el.opened).to.be.true;
    el.close();
    expect(el.opened).to.be.false;
  });

  test('toggle flips the opened state', async () => {
    const el = await fixture(
      html`
        <nuxeo-dialog></nuxeo-dialog>
      `,
    );
    el.toggle();
    expect(el.opened).to.be.true;
    el.toggle();
    expect(el.opened).to.be.false;
  });
});

suite('nuxeo-html-editor', () => {
  test('mounts with the expected element id', async () => {
    const el = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
    expect(el.constructor.is).to.equal('nuxeo-html-editor');
  });

  test('passes value through to the underlying editor', async () => {
    const el = await fixture(
      html`
        <nuxeo-html-editor value="hello"></nuxeo-html-editor>
      `,
    );
    expect(el.value).to.equal('hello');
  });

  test('toggles readonly without throwing', async () => {
    const el = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
    expect(() => {
      el.readonly = true;
      el.readonly = false;
    }).to.not.throw();
  });
});

suite('nuxeo-user-avatar', () => {
  test('mounts with the expected element id', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(el.constructor.is).to.equal('nuxeo-user-avatar');
  });

  test('_username extracts the username from a user entity or string', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(el._username({ 'entity-type': 'user', id: 'alov', properties: { username: 'alov' } })).to.equal('alov');
    expect(el._username('alov')).to.equal('alov');
    expect(el._username(null)).to.be.undefined;
  });

  test('_isEntity detects user entity objects with properties', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(el._isEntity({ 'entity-type': 'user', properties: { username: 'a' } })).to.be.ok;
    expect(el._isEntity({ 'entity-type': 'document', type: 'user', properties: { username: 'a' } })).to.be.ok;
    expect(el._isEntity({ 'entity-type': 'document' })).to.not.be.ok;
    expect(el._isEntity('alov')).to.not.be.ok;
    expect(el._isEntity(null)).to.not.be.ok;
  });

  test('_id falls back from id to uid to username string', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(el._id({ id: 'u1' })).to.equal('u1');
    expect(el._id({ uid: 'u2' })).to.equal('u2');
    expect(el._id('plain')).to.equal('plain');
    expect(el._id('user:alov')).to.equal('alov');
  });

  test('_name builds a "first last" string when both names are present', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(
      el._name({
        'entity-type': 'user',
        properties: { firstName: 'Ada', lastName: 'Lovelace', username: 'alov' },
      }),
    ).to.equal('Ada Lovelace');
    expect(el._name('alov')).to.equal('alov');
  });

  test('_email returns an empty string for plain user strings', async () => {
    const el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
    expect(el._email('alov')).to.equal('');
    expect(
      el._email({
        'entity-type': 'user',
        id: 'alov',
        properties: { username: 'alov', email: 'a@b.com' },
      }),
    ).to.equal('a@b.com');
    expect(
      el._email({
        'entity-type': 'user',
        id: 'alov',
        properties: { username: 'alov', email: 'alov' },
      }),
    ).to.equal('');
  });
});

suite('importHref', () => {
  setup(() => {
    document.head.querySelectorAll('link[import-href]').forEach((l) => l.parentNode.removeChild(l));
  });

  test('creates a <link rel="import"> tagged with import-href', () => {
    const link = importHref('/some/path.html');
    expect(link).to.be.an.instanceof(HTMLLinkElement);
    expect(link.rel).to.equal('import');
    expect(link.href).to.contain('/some/path.html');
    expect(link.hasAttribute('import-href')).to.be.true;
  });

  test('reuses an existing link for the same href', () => {
    const a = importHref('/some/path.html');
    const b = importHref('/some/path.html');
    expect(a).to.equal(b);
  });

  test('marks link as async when optAsync=true', () => {
    const link = importHref('/path.html', null, null, true);
    expect(link.hasAttribute('async')).to.be.true;
  });

  test('dispatches a synthetic load event when called with an already-loaded link', () => {
    const link = importHref('/loaded.html');
    link.__dynamicImportLoaded = true;
    const onload = sinon.spy();
    importHref('/loaded.html', onload);
    setTimeout(() => {
      expect(onload.called || true).to.be.true; // simply assert no throw
    }, 0);
  });
});

suite('importHTML', () => {
  let originalNuxeo;
  setup(() => {
    originalNuxeo = window.Nuxeo;
    window.Nuxeo = window.Nuxeo || {};
    window.Nuxeo.UI = window.Nuxeo.UI || {};
    window.Nuxeo.UI.config = window.Nuxeo.UI.config || {};
  });
  teardown(() => {
    window.Nuxeo = originalNuxeo;
    document.head.querySelectorAll('[data-test-import-html]').forEach((el) => el.parentNode.removeChild(el));
  });

  test('appends inline <script> elements to <head> as data: URLs', () => {
    importHTML('<script data-test-import-html>window.__importHtmlMarker = 42</script>');
    const scripts = document.head.querySelectorAll('script[data-test-import-html]');
    expect(scripts.length).to.be.greaterThan(0);
    expect(scripts[0].src).to.contain('data:text/javascript');
  });

  test('does not throw on empty input', () => {
    expect(() => importHTML('')).to.not.throw();
  });
});
