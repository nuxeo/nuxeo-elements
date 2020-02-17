import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import { until } from 'lit-html/directives/until.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { select } from '@storybook/addon-knobs';
import { LayoutBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-layout-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-layout.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker.js';
import hljs from 'highlight.js';
import '../../../.storybook/i18n';
import image from '../../img/image01.jpg';
import DocumentBuilder from '../../data/documents.data';

window.Polymer = Polymer;
window.Nuxeo.LayoutBehavior = LayoutBehavior;

const documentBuilder = new DocumentBuilder().setTitle('My Document').setFileContent('Nuxeo Logo', image);

const codePanel = (type, layout) => html`
  <style>
    .hljs {
      display: block;
      overflow-x: auto;
      padding: 0.5em;
      color: #abb2bf;
      background: #282c34;
      margin: 0;
    }

    .hljs-comment,
    .hljs-quote {
      color: #5c6370;
      font-style: italic;
    }

    .hljs-doctag,
    .hljs-keyword,
    .hljs-formula {
      color: #c678dd;
    }

    .hljs-section,
    .hljs-name,
    .hljs-selector-tag,
    .hljs-deletion,
    .hljs-subst {
      color: #e06c75;
    }

    .hljs-literal {
      color: #56b6c2;
    }

    .hljs-string,
    .hljs-regexp,
    .hljs-addition,
    .hljs-attribute,
    .hljs-meta-string {
      color: #98c379;
    }

    .hljs-built_in,
    .hljs-class .hljs-title {
      color: #e6c07b;
    }

    .hljs-attr,
    .hljs-variable,
    .hljs-template-variable,
    .hljs-type,
    .hljs-selector-class,
    .hljs-selector-attr,
    .hljs-selector-pseudo,
    .hljs-number {
      color: #d19a66;
    }

    .hljs-symbol,
    .hljs-bullet,
    .hljs-link,
    .hljs-meta,
    .hljs-selector-id,
    .hljs-title {
      color: #61aeee;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: bold;
    }

    .hljs-link {
      text-decoration: underline;
    }
  </style>
  <div style="margin-top: 32px">
    <span style="margin-left: 4px; color: #ddd">layout source</span>
    <span class="hljs">
      ${until(
        import(`!!raw-loader!../../../public/layouts/document/${type}/nuxeo-${type}-${layout}-layout.html`).then(
          (module) => {
            const val = hljs.highlight('html', module.default).value;
            return unsafeHTML(`<pre>${val}</pre>`);
          },
        ),
        html`
          <span>Loading layout source...</span>
        `,
      )}</span
    >
  </div>
`;

storiesOf('UI/nuxeo-document-layout', module)
  .add('Default', () => {
    const layout = select('Layout', ['view', 'edit', 'metadata'], 'view');
    return html`
      <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
        <nuxeo-document-layout
          .document="${documentBuilder.setType('File').build()}"
          layout="${layout}"
          href-base="layouts/document/"
        >
        </nuxeo-document-layout>
      </div>
      ${codePanel('file', layout)}
    `;
  })
  .add(
    'Custom validation',
    () => html`
      <p style="margin-left: 16px;">This layout won't allow Title and Description to have the same value.</p>
      <iron-form>
        <form style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
          <nuxeo-document-layout
            .document="${documentBuilder.setType('Picture').build()}"
            layout="edit"
            href-base="layouts/document/"
          >
          </nuxeo-document-layout>
          <button
            @click=${(e) => {
              const docLayout = e.target.previousElementSibling;
              const form = e.target.parentElement;
              const valid = docLayout.validate();
              form.style.border = `2px ${valid ? 'dashed green' : 'solid red'}`;
              e.preventDefault();
            }}
          >
            Validate
          </button>
        </form>
      </iron-form>
      ${codePanel('picture', 'edit')}
    `,
  )
  .add(
    'Missing layout',
    () =>
      html`
        <nuxeo-document-layout
          .document="${documentBuilder.setType('MyDoc').build()}"
          layout="edit"
          href-base="layouts/document/"
        >
        </nuxeo-document-layout>
      `,
  );
