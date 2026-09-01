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
import { html, fixture, flush, isElementVisible } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-tooltip.js';
import { ensureClonedContentStyles } from '../widgets/nuxeo-tooltip.js';

suite('nuxeo-tooltip', () => {
  test('Should not add paper-tooltip to the dom when hidden attribute is set', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip hidden>Hello</nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip).to.be.null;
  });

  test('Should show a paper-tooltip with content when the element is declared', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip.innerHTML).to.equal('Hello');
    expect(isElementVisible(paperTooltip));
  });

  test('hide removes only this instance paper-tooltip', async () => {
    const first = await fixture(
      html`
        <nuxeo-tooltip>One</nuxeo-tooltip>
      `,
    );
    const second = await fixture(
      html`
        <nuxeo-tooltip>Two</nuxeo-tooltip>
      `,
    );
    first.show();
    second.show();
    await flush();
    expect(document.body.querySelectorAll('paper-tooltip')).to.have.lengthOf(2);

    first.hide();
    await flush();
    const remaining = document.body.querySelector('paper-tooltip');
    expect(remaining).to.exist;
    expect(remaining.textContent.trim()).to.equal('Two');

    second.hide();
    await flush();
    expect(document.body.querySelector('paper-tooltip')).to.be.null;
  });

  test('isShowing and updatePositionIfShowing reposition an active tooltip', async () => {
    const host = await fixture(html`
      <div>
        <span id="tooltip-target">Target</span>
        <nuxeo-tooltip for="tooltip-target" position="top">Tip text</nuxeo-tooltip>
      </div>
    `);
    const tooltip = host.querySelector('nuxeo-tooltip');
    expect(tooltip.isShowing()).to.be.false;

    tooltip.show();
    await flush();
    expect(tooltip.isShowing()).to.be.true;

    const updateSpy = sinon.spy(tooltip._tooltip, 'updatePosition');
    tooltip.updatePositionIfShowing();
    expect(updateSpy).to.have.been.calledOnce;

    tooltip.hide();
    await flush();
    expect(tooltip.isShowing()).to.be.false;
  });

  test('updatePositionIfShowing is a no-op when the tooltip is hidden', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );
    expect(tooltip.isShowing()).to.be.false;
    tooltip.updatePositionIfShowing();
    expect(tooltip._tooltip).to.not.exist;
    expect(tooltip.isShowing()).to.be.false;
  });

  test('window keydown hides the tooltip', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );
    tooltip.show();
    await flush();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    await flush();
    expect(document.body.querySelector('paper-tooltip')).to.be.null;
  });

  test('Should stamp role only on element clones, not text nodes', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip data-nx-tooltip-role="resize-handle">
          Text node
          <span class="resize-handle-tooltip-label">Resize pane</span>
        </nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip.textContent).to.include('Text node');
    const label = paperTooltip.querySelector('[data-nx-tooltip-role="resize-handle"]');
    expect(label).to.exist;
    expect(label.tagName).to.equal('SPAN');
    tooltip.hide();
    await flush();
  });

  test('Should stamp data-nx-tooltip-role onto cloned slot content', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip data-nx-tooltip-role="resize-handle">
          <span class="resize-handle-tooltip-label">Resize pane</span>
        </nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    const label = paperTooltip.querySelector('[data-nx-tooltip-role="resize-handle"]');
    expect(label).to.exist;
    expect(label.classList.contains('resize-handle-tooltip-label')).to.be.true;
    tooltip.hide();
    await flush();
  });

  test('Should not overwrite data-nx-tooltip-role on cloned content', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip data-nx-tooltip-role="resize-handle">
          <span data-nx-tooltip-role="custom" class="resize-handle-tooltip-label">Resize</span>
        </nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const label = document.body.querySelector('.resize-handle-tooltip-label');
    expect(label.dataset.nxTooltipRole).to.equal('custom');
    tooltip.hide();
    await flush();
  });

  test('injects cloned-content stylesheet once', () => {
    expect(document.getElementById('nuxeo-tooltip-cloned-content-styles')).to.exist;
    expect(document.querySelectorAll('#nuxeo-tooltip-cloned-content-styles')).to.have.lengthOf(1);
    ensureClonedContentStyles();
    expect(document.querySelectorAll('#nuxeo-tooltip-cloned-content-styles')).to.have.lengthOf(1);
  });

  test('connectedCallback skips listeners when the target is missing', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip for="missing-target">Orphan</nuxeo-tooltip>
      `,
    );
    expect(tooltip._target).to.be.null;
    tooltip.remove();
    await flush();
  });

  test('hide tolerates a detached paper-tooltip node', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );
    tooltip._tooltip = { hide: sinon.spy(), remove: sinon.spy() };
    tooltip.hide();
    expect(tooltip._tooltip).to.be.null;
  });

  test('target resolves to the parent host when not using for', async () => {
    const host = await fixture(
      html`
        <div id="host"><nuxeo-tooltip>On parent</nuxeo-tooltip></div>
      `,
    );
    const tooltip = host.querySelector('nuxeo-tooltip');
    expect(tooltip.target).to.equal(host);
  });

  test('target resolves to the shadow host when slotted in a shadow root', async () => {
    const hostTag = 'nuxeo-tooltip-host-fixture';
    if (!customElements.get(hostTag)) {
      customElements.define(
        'nuxeo-tooltip-host-fixture',
        class extends HTMLElement {
          connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = '<nuxeo-tooltip id="inner-tip">Shadow tip</nuxeo-tooltip>';
          }
        },
      );
    }

    const host = await fixture(
      html`
        <nuxeo-tooltip-host-fixture></nuxeo-tooltip-host-fixture>
      `,
    );
    const tooltip = host.shadowRoot.querySelector('nuxeo-tooltip');
    expect(tooltip.target).to.equal(host);
  });
});
