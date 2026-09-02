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
import { html, fixture, flush, isElementVisible, timePasses } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-tooltip.js';
import { ensureClonedContentStyles } from '../widgets/nuxeo-tooltip.js';
import { TOOLTIP_DISMISS_KEYS, TOOLTIP_POINTER_LEAVE_DELAY_MS } from '../widgets/nuxeo-tooltip-a11y-behavior.js';

/** Dispatches a keydown from inside the document, so it travels the real propagation path. */
function pressKey(key) {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
}

/**
 * Dispatches a keydown that an ancestor stops before it can reach anything below `window`'s capture
 * phase — what `IronMenuBehavior._onKeydown` does for every key in the Web UI navigation menu.
 */
function pressKeyWithPropagationStopped(key) {
  const stop = (event) => {
    if (event.key === key) {
      event.stopPropagation();
    }
  };
  document.addEventListener('keydown', stop, true);
  try {
    pressKey(key);
  } finally {
    document.removeEventListener('keydown', stop, true);
  }
}

const enter = (node) => node.dispatchEvent(new MouseEvent('mouseenter'));
const leave = (node) => node.dispatchEvent(new MouseEvent('mouseleave'));

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

  test('Escape hides the tooltip', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );
    tooltip.show();
    await flush();
    pressKey('Escape');
    await flush();
    expect(document.body.querySelector('paper-tooltip')).to.be.null;
    expect(tooltip.isTooltipDismissed()).to.be.true;
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

  /**
   * WCAG 2.1 AA 1.4.13 "Content on Hover or Focus" — the tooltip must be dismissible, hoverable
   * and persistent — plus the ARIA wiring assistive technologies need (WEBUI-504).
   */
  suite('WCAG 1.4.13 content on hover or focus', () => {
    /** `<span>` trigger with a tooltip bound to it via `for`. */
    async function triggerFixture() {
      const host = await fixture(html`
        <div>
          <span id="a11y-target">Target</span>
          <nuxeo-tooltip for="a11y-target">Tooltip text</nuxeo-tooltip>
        </div>
      `);
      return { host, target: host.querySelector('#a11y-target'), tooltip: host.querySelector('nuxeo-tooltip') };
    }

    suite('dismissible', () => {
      test('Escape dismisses the tooltip while the pointer stays on the trigger', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        expect(tooltip.isShowing()).to.be.true;

        pressKey('Escape');
        await flush();
        expect(tooltip.isShowing()).to.be.false;
        expect(document.body.querySelector('paper-tooltip')).to.be.null;
      });

      test('Escape dismisses even when an ancestor stops keydown propagation', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        expect(tooltip.isShowing()).to.be.true;

        pressKeyWithPropagationStopped('Escape');
        await flush();
        expect(tooltip.isShowing()).to.be.false;
      });

      test('the legacy "Esc" key value also dismisses', async () => {
        expect(TOOLTIP_DISMISS_KEYS).to.include.members(['Escape', 'Esc']);
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        pressKey('Esc');
        await flush();
        expect(tooltip.isShowing()).to.be.false;
      });

      test('a dismissed tooltip does not come back while the trigger is still hovered', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        pressKey('Escape');
        await flush();

        // nuxeo-resize-handle re-fires mouseenter on every mousemove over its trigger.
        enter(target);
        await flush();
        expect(tooltip.isShowing()).to.be.false;
      });

      test('the trigger shows the tooltip again once the pointer really leaves', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 0;
        enter(target);
        await flush();
        pressKey('Escape');
        await flush();

        leave(target);
        await flush();
        expect(tooltip.isTooltipDismissed()).to.be.false;
        enter(target);
        await flush();
        expect(tooltip.isShowing()).to.be.true;
      });

      test('blur clears the dismissal so focusing the trigger again shows the tooltip', async () => {
        const { target, tooltip } = await triggerFixture();
        target.dispatchEvent(new FocusEvent('focus'));
        await flush();
        pressKey('Escape');
        await flush();
        expect(tooltip.isTooltipDismissed()).to.be.true;

        target.dispatchEvent(new FocusEvent('blur'));
        await flush();
        expect(tooltip.isTooltipDismissed()).to.be.false;
        target.dispatchEvent(new FocusEvent('focus'));
        await flush();
        expect(tooltip.isShowing()).to.be.true;
      });

      test('keydown() without an event still dismisses, for backwards compatibility', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        tooltip.keydown();
        await flush();
        expect(tooltip.isShowing()).to.be.false;
      });

      test('keydown() dismisses for a dismissal key and ignores anything else', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();

        tooltip.keydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        await flush();
        expect(tooltip.isShowing()).to.be.true;

        tooltip.keydown(new KeyboardEvent('keydown', { key: 'Escape' }));
        await flush();
        expect(tooltip.isShowing()).to.be.false;
      });

      test('dismissing a tooltip that shows nothing is a no-op', async () => {
        const { tooltip } = await triggerFixture();
        tooltip.keydown();
        await flush();
        expect(tooltip.isTooltipDismissed()).to.be.false;
      });

      test('arming and disarming the behavior twice changes nothing', async () => {
        // Polymer re-runs attached/detached when an element is moved between parents.
        const { target, tooltip } = await triggerFixture();
        tooltip._armTooltipA11y();
        expect(target.getAttribute('aria-describedby')).to.equal(tooltip.id);

        tooltip._disarmTooltipA11y();
        tooltip._disarmTooltipA11y();
        expect(target.hasAttribute('aria-describedby')).to.be.false;
      });

      test('only the tooltips that are actually rendered listen for the dismissal key', async () => {
        // A screen can hold a hundred tooltips, so they share one listener and it is only on the
        // window while there is something to dismiss.
        const added = sinon.spy(window, 'addEventListener');
        const removed = sinon.spy(window, 'removeEventListener');
        try {
          const first = await triggerFixture();
          const second = await triggerFixture();
          expect(added.calledWith('keydown'), 'no listener while nothing is rendered').to.be.false;

          enter(first.target);
          await flush();
          enter(second.target);
          await flush();
          expect(added.withArgs('keydown').callCount, 'a single shared listener').to.equal(1);

          pressKey('Escape');
          await flush();
          expect(first.tooltip.isShowing()).to.be.false;
          expect(second.tooltip.isShowing()).to.be.false;
          expect(removed.withArgs('keydown').callCount, 'dropped once the last one is gone').to.equal(1);
        } finally {
          added.restore();
          removed.restore();
        }
      });
    });

    suite('hoverable', () => {
      test('leaving the trigger only schedules the teardown', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 40;
        enter(target);
        await flush();
        const bubble = tooltip._tooltip;

        leave(target);
        await flush();
        expect(tooltip._tooltip, 'tooltip is kept while the pointer travels to it').to.equal(bubble);
      });

      test('the pointer can rest on the tooltip without it disappearing', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 40;
        enter(target);
        await flush();
        const bubble = tooltip._tooltip;

        leave(target);
        enter(bubble);
        await timePasses(120);
        expect(tooltip._tooltip).to.equal(bubble);
        expect(bubble.isConnected).to.be.true;
      });

      test('the tooltip goes away once the pointer leaves it too', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 40;
        enter(target);
        await flush();
        const bubble = tooltip._tooltip;
        leave(target);
        enter(bubble);
        await timePasses(60);

        leave(bubble);
        await timePasses(120);
        expect(tooltip._tooltip).to.be.null;
        expect(bubble.isConnected).to.be.false;
      });

      test('re-entering the trigger during the grace period keeps the same tooltip', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 60;
        enter(target);
        await flush();
        const bubble = tooltip._tooltip;

        leave(target);
        enter(target);
        await timePasses(140);
        expect(tooltip._tooltip).to.equal(bubble);
      });

      test('the tooltip is torn down when the pointer leaves without reaching it', async () => {
        const { target, tooltip } = await triggerFixture();
        tooltip.pointerLeaveDelay = 20;
        enter(target);
        await flush();

        leave(target);
        await timePasses(80);
        expect(tooltip._tooltip).to.be.null;
      });

      test('pressing the pointer on the tooltip hides it so the click reaches the content below', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        const bubble = tooltip._tooltip;

        bubble.dispatchEvent(new MouseEvent('mousedown'));
        await flush();
        expect(tooltip._tooltip).to.be.null;
      });

      test('the pointer grace period defaults to the shared constant', async () => {
        const { tooltip } = await triggerFixture();
        expect(tooltip.pointerLeaveDelay).to.equal(TOOLTIP_POINTER_LEAVE_DELAY_MS);
      });
    });

    suite('persistent', () => {
      test('an unrelated keystroke leaves the tooltip visible', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();

        ['a', 'ArrowDown', 'Shift', 'Enter', 'Tab'].forEach((key) => pressKey(key));
        await flush();
        expect(tooltip.isShowing()).to.be.true;
      });

      test('nothing hides the tooltip on its own while the trigger stays hovered', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();

        await timePasses(TOOLTIP_POINTER_LEAVE_DELAY_MS * 3);
        expect(tooltip.isShowing()).to.be.true;
      });
    });

    suite('accessible description', () => {
      test('the tooltip gets role="tooltip" and an id, and describes its trigger', async () => {
        const { target, tooltip } = await triggerFixture();
        expect(tooltip.getAttribute('role')).to.equal('tooltip');
        expect(tooltip.id).to.match(/^nuxeo-tooltip-\d+$/);
        expect(target.getAttribute('aria-describedby')).to.equal(tooltip.id);
      });

      test('an author-provided id is reused instead of being replaced', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target">Target</span>
            <nuxeo-tooltip id="my-tooltip" for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').getAttribute('aria-describedby')).to.equal('my-tooltip');
      });

      test('an existing aria-describedby is appended to and restored on disconnect', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target" aria-describedby="other-hint">Target</span>
            <nuxeo-tooltip for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        const target = host.querySelector('#described-target');
        const tooltip = host.querySelector('nuxeo-tooltip');
        expect(target.getAttribute('aria-describedby')).to.equal(`other-hint ${tooltip.id}`);

        tooltip.remove();
        await flush();
        expect(target.getAttribute('aria-describedby')).to.equal('other-hint');
      });

      test('aria-describedby is removed from the trigger on disconnect', async () => {
        const { target, tooltip } = await triggerFixture();
        expect(target.hasAttribute('aria-describedby')).to.be.true;

        tooltip.remove();
        await flush();
        expect(target.hasAttribute('aria-describedby')).to.be.false;
      });

      test('a trigger whose accessible name already says the same thing is not described twice', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target" aria-label="Tooltip text">Target</span>
            <nuxeo-tooltip for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').hasAttribute('aria-describedby')).to.be.false;
      });

      test('a trigger labelled by this very tooltip is not described by it as well', async () => {
        // The nuxeo-menu-icon pattern: aria-labelledby points straight at the tooltip.
        const host = await fixture(html`
          <div>
            <span id="described-target" aria-labelledby="my-tooltip">Target</span>
            <nuxeo-tooltip id="my-tooltip" for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').hasAttribute('aria-describedby')).to.be.false;
      });

      test('a trigger labelled by another node with the same text is not described twice', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target" aria-labelledby="visible-label">Target</span>
            <span id="visible-label">Tooltip text</span>
            <nuxeo-tooltip for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').hasAttribute('aria-describedby')).to.be.false;
      });

      test('a trigger labelled with different text is still described by the tooltip', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target" aria-labelledby="visible-label">Target</span>
            <span id="visible-label">Some other label</span>
            <nuxeo-tooltip for="described-target">Tooltip text</nuxeo-tooltip>
          </div>
        `);
        const tooltip = host.querySelector('nuxeo-tooltip');
        expect(host.querySelector('#described-target').getAttribute('aria-describedby')).to.equal(tooltip.id);
      });

      test('a hidden tooltip does not describe its trigger', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target">Target</span>
            <nuxeo-tooltip for="described-target" hidden>Tooltip text</nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').hasAttribute('aria-describedby')).to.be.false;
      });

      test('toggling hidden after attach keeps the description in sync without any interaction', async () => {
        // nuxeo-date binds hidden$ on its tooltip, and a screen reader user may never hover it.
        const { target, tooltip } = await triggerFixture();
        expect(target.getAttribute('aria-describedby')).to.equal(tooltip.id);

        tooltip.hidden = true;
        await flush();
        expect(target.hasAttribute('aria-describedby')).to.be.false;

        tooltip.hidden = false;
        await flush();
        expect(target.getAttribute('aria-describedby')).to.equal(tooltip.id);
      });

      test('a trigger that is no longer the target stops referencing the tooltip', async () => {
        const { target, tooltip } = await triggerFixture();
        expect(target.getAttribute('aria-describedby')).to.equal(tooltip.id);

        target.remove();
        tooltip._syncTooltipDescription();
        expect(target.hasAttribute('aria-describedby')).to.be.false;
      });

      test('an empty tooltip does not describe its trigger', async () => {
        const host = await fixture(html`
          <div>
            <span id="described-target">Target</span>
            <nuxeo-tooltip for="described-target"></nuxeo-tooltip>
          </div>
        `);
        expect(host.querySelector('#described-target').hasAttribute('aria-describedby')).to.be.false;
      });

      test('no description is wired across a shadow boundary, where the id cannot resolve', async () => {
        if (!customElements.get('nuxeo-tooltip-aria-host-fixture')) {
          customElements.define(
            'nuxeo-tooltip-aria-host-fixture',
            class extends HTMLElement {
              connectedCallback() {
                this.attachShadow({ mode: 'open' });
                this.shadowRoot.innerHTML = '<nuxeo-tooltip>Shadow tip</nuxeo-tooltip>';
              }
            },
          );
        }
        const host = await fixture(
          html`
            <nuxeo-tooltip-aria-host-fixture></nuxeo-tooltip-aria-host-fixture>
          `,
        );
        await flush();
        const tooltip = host.shadowRoot.querySelector('nuxeo-tooltip');
        expect(tooltip.target).to.equal(host);
        expect(host.hasAttribute('aria-describedby')).to.be.false;
      });

      test('the rendered clone is hidden from assistive technologies', async () => {
        const { target, tooltip } = await triggerFixture();
        enter(target);
        await flush();
        expect(tooltip._tooltip.getAttribute('aria-hidden')).to.equal('true');
        expect(tooltip._tooltip.getAttribute('role')).to.equal('tooltip');
      });
    });
  });
});
