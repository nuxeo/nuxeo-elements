/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
 * Accessibility contract for the `nuxeo-view-user` template (SonarCloud Web:S6853).
 *
 * `nuxeo-view-user` ships as a Polymer HTML import so that deployments can override it, and the
 * `nuxeo-view-user` tag is already claimed by lightweight stubs in the `nuxeo-user-management` and
 * `nuxeo-user-profile` suites, which load earlier in the aggregate run. Rather than fight over the
 * tag name, this suite reads the shipped `nuxeo-view-user.html`, lifts the template out of its
 * `dom-module`, and stamps it under a test-only tag. The markup under test is therefore exactly the
 * markup that ships.
 */
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

// Export Polymer for 1.x/2.x compat, as the other legacy suites do.
window.Polymer = Polymer;

window.Nuxeo = window.Nuxeo || {};
Nuxeo.I18nBehavior = I18nBehavior;

const TAG = 'nuxeo-view-user-shipped-template';
const SOURCE = '../nuxeo-user-group-management/nuxeo-view-user.html';

/** Fetches the shipped element and returns its `dom-module` template, adopted into this document. */
async function importShippedTemplate() {
  const response = await fetch(new URL(SOURCE, import.meta.url).href);
  if (!response.ok) {
    throw new Error(`Could not read ${SOURCE}: ${response.status}`);
  }
  const source = await response.text();
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const template = parsed.querySelector('dom-module#nuxeo-view-user > template');
  if (!template) {
    throw new Error(`No dom-module template found in ${SOURCE}`);
  }
  return document.importNode(template, true);
}

const LABELS = { 'viewUser.email': 'Email', 'viewUser.company': 'Company' };

suite('nuxeo-view-user template accessibility', () => {
  let el;
  let originalLanguage;
  let createdEnDict;
  let originalLabels;

  suiteSetup(async () => {
    if (!customElements.get(TAG)) {
      Polymer({
        is: TAG,
        _template: await importShippedTemplate(),
        behaviors: [I18nBehavior],
        properties: {
          user: {
            type: Object,
            value: {},
          },
        },
      });
    }
    // Add only the two keys under test to the shared bundle, remembering the prior state of the `en`
    // dict and of each key so the teardown restores it exactly. This matters because another suite may
    // have loaded a real i18n bundle already; blindly deleting these keys would clobber its messages.
    originalLanguage = window.nuxeo.I18n.language;
    window.nuxeo.I18n.language = 'en';
    createdEnDict = !window.nuxeo.I18n.en;
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
    originalLabels = Object.keys(LABELS).map((key) => {
      return {
        key,
        existed: Object.prototype.hasOwnProperty.call(window.nuxeo.I18n.en, key),
        value: window.nuxeo.I18n.en[key],
      };
    });
    Object.assign(window.nuxeo.I18n.en, LABELS);
  });

  suiteTeardown(() => {
    // Restore each key to its prior state rather than deleting unconditionally, and drop the `en`
    // dict only if this suite created it, so the shared dictionary is left exactly as we found it.
    originalLabels.forEach(({ key, existed, value }) => {
      if (existed) {
        window.nuxeo.I18n.en[key] = value;
      } else {
        delete window.nuxeo.I18n.en[key];
      }
    });
    if (createdEnDict) {
      delete window.nuxeo.I18n.en;
    }
    window.nuxeo.I18n.language = originalLanguage;
  });

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-view-user-shipped-template
          .user="${{ properties: { email: 'jdoe@example.com', company: 'Hyland' } }}"
        ></nuxeo-view-user-shipped-template>
      `,
    );
    await flush();
  });

  /** Resolves the term/definition pair of the field wrapper carrying `name="<field>"`. */
  const fieldOf = (name) => {
    const wrapper = el.shadowRoot.querySelector(`[name="${name}"]`);
    expect(wrapper, `no wrapper for field "${name}"`).to.not.be.null;
    return { wrapper, term: wrapper.querySelector('dt'), definition: wrapper.querySelector('dd') };
  };

  test('uses no orphan label element', () => {
    // Web:S6853 — a label with no associated control has no accessible text.
    expect(el.shadowRoot.querySelectorAll('label')).to.have.lengthOf(0);
  });

  test('wraps the fields in a description list', () => {
    const list = el.shadowRoot.querySelector('dl');
    expect(list).to.not.be.null;
    expect(list.querySelectorAll('dt')).to.have.lengthOf(2);
    expect(list.querySelectorAll('dd')).to.have.lengthOf(2);
  });

  ['email', 'company'].forEach((name) => {
    test(`associates the "${name}" value with its name`, () => {
      const { term, definition } = fieldOf(name);
      expect(term, `no dt for "${name}"`).to.not.be.null;
      expect(definition, `no dd for "${name}"`).to.not.be.null;

      // Non-empty accessible text, and an explicit association on top of the dt/dd pairing.
      expect(term.textContent.trim()).to.not.be.empty;
      expect(term.id).to.not.be.empty;
      expect(definition.getAttribute('aria-labelledby')).to.equal(term.id);
      expect(el.shadowRoot.getElementById(term.id)).to.equal(term);
    });
  });

  test('keeps the field names and value spans that existing selectors rely on', () => {
    expect(fieldOf('email').definition.querySelector('span').textContent).to.equal('jdoe@example.com');
    expect(fieldOf('company').definition.querySelector('span').textContent).to.equal('Hyland');
  });

  test('keeps the original layout: name above value, fields side by side, no list indentation', () => {
    const email = fieldOf('email');
    const company = fieldOf('company');
    // UA margins on dl/dd would otherwise shift and indent the fields.
    expect(getComputedStyle(el.shadowRoot.querySelector('dl')).marginTop).to.equal('0px');
    expect(getComputedStyle(email.definition).marginInlineStart).to.equal('0px');
    expect(email.term.getBoundingClientRect().top).to.be.below(email.definition.getBoundingClientRect().top);
    expect(email.wrapper.getBoundingClientRect().left).to.be.below(company.wrapper.getBoundingClientRect().left);
  });

  test('renders the translated field names', () => {
    expect(fieldOf('email').term.textContent).to.equal('Email');
    expect(fieldOf('company').term.textContent).to.equal('Company');
  });
});
