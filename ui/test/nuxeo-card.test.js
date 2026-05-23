/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-card.js';

suite('nuxeo-card extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-card></nuxeo-card>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.Card.is).to.equal('nuxeo-card');
  });

  test('should have expected default property values', () => {
    expect(Nuxeo.Card.properties.icon.value).to.equal(null);
    expect(Nuxeo.Card.properties.heading.value).to.equal(null);
    expect(Nuxeo.Card.properties.collapsible.value).to.be.false;
    expect(Nuxeo.Card.properties.opened.value).to.be.false;
  });

  suite('_hasHeading', () => {
    test('returns truthy when icon is set', () => {
      expect(el._hasHeading('icons:home', null, false)).to.be.ok;
    });

    test('returns truthy when heading is set', () => {
      expect(el._hasHeading(null, 'My Heading', false)).to.be.ok;
    });

    test('returns truthy when collapsible is true', () => {
      expect(el._hasHeading(null, null, true)).to.be.true;
    });

    test('returns falsy when nothing is set', () => {
      expect(el._hasHeading(null, null, false)).to.not.be.ok;
    });
  });

  suite('_getHeadingTabindex', () => {
    test('returns "0" for collapsible cards', () => {
      expect(el._getHeadingTabindex(true)).to.equal('0');
    });

    test('returns "-1" for non-collapsible cards', () => {
      expect(el._getHeadingTabindex(false)).to.equal('-1');
    });
  });

  suite('_opened', () => {
    test('returns true for non-collapsible cards regardless of opened', () => {
      expect(el._opened(false, false)).to.be.true;
      expect(el._opened(true, false)).to.be.true;
    });

    test('returns opened state for collapsible cards', () => {
      expect(el._opened(true, true)).to.be.true;
      expect(el._opened(false, true)).to.be.false;
    });
  });

  suite('_toggleIcon', () => {
    test('returns up arrow when opened', () => {
      expect(el._toggleIcon(true)).to.equal('hardware:keyboard-arrow-up');
    });

    test('returns down arrow when closed', () => {
      expect(el._toggleIcon(false)).to.equal('hardware:keyboard-arrow-down');
    });
  });

  suite('_toggle', () => {
    test('does nothing when not collapsible', () => {
      el.collapsible = false;
      el.opened = false;
      el._toggle();
      expect(el.opened).to.be.false;
    });

    test('flips opened when collapsible', () => {
      el.collapsible = true;
      el.opened = false;
      el._toggle();
      expect(el.opened).to.be.true;
      el._toggle();
      expect(el.opened).to.be.false;
    });
  });

  suite('_toggleKeydown', () => {
    test('triggers toggle on Enter when collapsible', () => {
      el.collapsible = true;
      el.opened = false;
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      el._toggleKeydown(event);
      expect(el.opened).to.be.true;
    });

    test('triggers toggle on Space when collapsible', () => {
      el.collapsible = true;
      el.opened = false;
      const event = new KeyboardEvent('keydown', { key: ' ' });
      el._toggleKeydown(event);
      expect(el.opened).to.be.true;
    });

    test('triggers toggle on Spacebar (legacy) when collapsible', () => {
      el.collapsible = true;
      el.opened = false;
      const event = new KeyboardEvent('keydown', { key: 'Spacebar' });
      el._toggleKeydown(event);
      expect(el.opened).to.be.true;
    });

    test('ignores other keys', () => {
      el.collapsible = true;
      el.opened = false;
      const event = new KeyboardEvent('keydown', { key: 'a' });
      el._toggleKeydown(event);
      expect(el.opened).to.be.false;
    });

    test('is a no-op when event is missing or not keydown', () => {
      el.collapsible = true;
      el.opened = false;
      el._toggleKeydown(null);
      el._toggleKeydown({ type: 'click' });
      expect(el.opened).to.be.false;
    });
  });

  test('connectedCallback sets dir attribute when not present', async () => {
    const card = await fixture(html`
      <nuxeo-card></nuxeo-card>
    `);
    expect(card.hasAttribute('dir')).to.be.true;
  });
});
