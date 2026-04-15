import { html } from 'lit';
import { LayoutBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-layout-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-layout.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker.js';
import '../../../.storybook/i18n';
import image from '../../img/image01.jpg';
import DocumentBuilder from '../../data/documents.data.js';
import { codePanelTemplate } from '../code-panel-template.js';

window.Polymer = Polymer;
window.Nuxeo.LayoutBehavior = LayoutBehavior;

const documentBuilder = new DocumentBuilder().setTitle('My Document').setFileContent('Nuxeo Logo', image);

export default {
  title: 'UI/nuxeo-document-layout',
};

export const Default = {
  args: { layout: 'view' },
  argTypes: {
    layout: { control: 'select', options: ['view', 'edit', 'metadata'] },
  },
  render: (args) => html`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-document-layout
        .document="${documentBuilder.setType('File').build()}"
        layout="${args.layout}"
        href-base="layouts/document/"
      >
      </nuxeo-document-layout>
    </div>
    ${codePanelTemplate(`document/file/nuxeo-file-${args.layout}-layout.html`)}
  `,
};

export const CustomValidation = {
  render: () => html`
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
    ${codePanelTemplate('document/picture/nuxeo-picture-edit-layout.html')}
  `,
};

export const MissingLayout = {
  render: () => html`
    <nuxeo-document-layout
      .document="${documentBuilder.setType('MyDoc').build()}"
      layout="edit"
      href-base="layouts/document/"
    >
    </nuxeo-document-layout>
  `,
};
