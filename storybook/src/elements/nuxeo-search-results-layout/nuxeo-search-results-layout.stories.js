import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import { LayoutBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-layout-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@nuxeo/nuxeo-ui-elements/search/nuxeo-search-results-layout.js';
import { codePanelTemplate } from '../code-panel-template.js';

window.Polymer = Polymer;
window.Nuxeo.LayoutBehavior = LayoutBehavior;

storiesOf('UI/nuxeo-search-results-layout', module)
  .add(
    'Default',
    () => html`
      <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
        <nuxeo-search-results-layout
          id="results"
          search-name="test"
          href-base="layouts/search/"
        ></nuxeo-search-results-layout>
      </div>
      <button @click=${(e) => e.target.parentElement.querySelector('#results').fetch()}>
        Fetch results
      </button>
      <button @click=${(e) => e.target.parentElement.querySelector('#results').reset()}>
        Reset results
      </button>
      ${codePanelTemplate('search/test/nuxeo-test-search-results.html')}
    `,
  )
  .add(
    'Missing layout',
    () => html`
      <nuxeo-search-results-layout search-name="other" href-base="layouts/search/"></nuxeo-search-results-layout>
    `,
  );
