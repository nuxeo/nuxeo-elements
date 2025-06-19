import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { marked } from 'marked';

class MarkedElement extends PolymerElement {
  static get is() {
    return 'marked-element';
  }

  static get properties() {
    return {
      markdown: {
        type: String,
        observer: '_markdownChanged',
      },
      sanitize: {
        type: Boolean,
        value: false,
      },
    };
  }

  static get template() {
    return html`<div id="content"></div>`;
  }

  _markdownChanged(value) {
    if (!value) {
      this.$.content.innerHTML = '';
      return;
    }

    // Render markdown
    const htmlOutput = marked(value, {
      breaks: true,
      gfm: true,
    });

    this.$.content.innerHTML = this.sanitize ? this._basicSanitize(htmlOutput) : htmlOutput;
  }

  _basicSanitize(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('script').forEach((script) => script.remove());
    return div.innerHTML;
  }
}

customElements.define(MarkedElement.is, MarkedElement);