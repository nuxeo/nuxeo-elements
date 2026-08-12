/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-preview-button.js';

suite('nuxeo-preview-button', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-preview-button
          document='{ "entity-type": "document", "facets": [], "properties": { "file:content": "document content" } }'
        ></nuxeo-preview-button>
      `,
    );
    await flush();
  });

  suite('accessible name', () => {
    test('states the action in full, not the short tooltip', () => {
      expect(el._computeAriaLabel()).to.equal(el.i18n('previewButton.ariaLabel'));
      expect(el._computeLabel()).to.equal(el.i18n('previewButton.tooltip'));
      expect(el._computeAriaLabel()).to.not.equal(el._computeLabel());
    });

    test('exposes the accessible name on the icon button', () => {
      const button = el.shadowRoot.querySelector('paper-icon-button');
      expect(button).to.exist;
      expect(button.getAttribute('aria-label')).to.equal(el.i18n('previewButton.ariaLabel'));
      // aria-labelledby would win over aria-label, so the old label reference must be gone.
      expect(button.hasAttribute('aria-labelledby')).to.be.false;
    });
  });
});
