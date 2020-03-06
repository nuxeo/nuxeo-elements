/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
import { fixture, flush, html, isElementVisible } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import '../nuxeo-error.js';
/* eslint-disable no-unused-expressions */

suite('<nuxeo-error>', () => {
  const expectNuxeoErrorContent = (nuxeoError, code, description, url, message) => {
    expect(isElementVisible(nuxeoError)).to.be.true;

    const errorCode = nuxeoError.shadowRoot.querySelector('.code');
    expect(isElementVisible(errorCode)).to.be.true;
    expect(errorCode.innerText).to.equal(code);

    const errorDescription = nuxeoError.shadowRoot.querySelector('.description');
    expect(isElementVisible(errorDescription)).to.be.true;
    expect(errorDescription.innerText).to.equal(description);

    const errorUrl = nuxeoError.shadowRoot.querySelector('.url');
    expect(isElementVisible(errorUrl)).to.be.true;
    expect(errorUrl.innerText).to.equal(url);

    const errorMessage = nuxeoError.shadowRoot.querySelector('.message');
    expect(isElementVisible(errorMessage)).to.be.true;
    expect(errorMessage.innerText).to.equal(message);
  };

  test('Should display error messages when properties are set', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error code="404" url="notfound.html" message="Failed to find layout"></nuxeo-error>
      `,
    );
    await flush();

    expectNuxeoErrorContent(nuxeoError, '404', 'ERROR.404', 'notfound.html', 'Failed to find layout');
  });

  test('Should display empty error messages when no proprieties are present', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error></nuxeo-error>
      `,
    );
    await flush();

    expect(isElementVisible(nuxeoError)).to.be.true;

    const code = nuxeoError.shadowRoot.querySelector('.code');
    expect(isElementVisible(code)).to.be.false;
    expect(code.innerText).to.be.empty;

    const description = nuxeoError.shadowRoot.querySelector('.description');
    expect(isElementVisible(description)).to.be.true;
    expect(description.innerText).to.be.empty;

    const url = nuxeoError.shadowRoot.querySelector('.url');
    expect(isElementVisible(url)).to.be.true;
    expect(url.innerText).to.be.empty;

    const message = nuxeoError.shadowRoot.querySelector('.message');
    expect(isElementVisible(message)).to.be.true;
    expect(message.innerText).to.be.empty;
  });

  test('Should not display error messages when properties are empty', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error code="" url="" message=""></nuxeo-error>
      `,
    );
    await flush();

    expect(isElementVisible(nuxeoError)).to.be.true;

    const code = nuxeoError.shadowRoot.querySelector('.code');
    expect(isElementVisible(code)).to.be.false;
    expect(code.innerText).to.be.empty;

    const description = nuxeoError.shadowRoot.querySelector('.description');
    expect(isElementVisible(description)).to.be.false;
    expect(description.innerText).to.equal('error.');

    const url = nuxeoError.shadowRoot.querySelector('.url');
    expect(isElementVisible(url)).to.be.false;
    expect(url.innerText).to.be.empty;

    const message = nuxeoError.shadowRoot.querySelector('.message');
    expect(isElementVisible(message)).to.be.false;
    expect(message.innerText).to.be.empty;
  });

  test('Should display error messages when "show" function is run', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error code="404" url="notfound.html" message="Failed to find layout"></nuxeo-error>
      `,
    );
    await flush();

    nuxeoError.show();
    expectNuxeoErrorContent(nuxeoError, '404', 'ERROR.404', 'notfound.html', 'Failed to find layout');
  });

  test('Should display error messages when "show" function is run with arguments', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error></nuxeo-error>
      `,
    );
    await flush();

    nuxeoError.show('404', 'notfound.html', 'Failed to find layout');
    expectNuxeoErrorContent(nuxeoError, '404', 'ERROR.404', 'notfound.html', 'Failed to find layout');
  });

  test('Should hide nuxeo-error when "hide" function is run', async () => {
    const nuxeoError = await fixture(
      html`
        <nuxeo-error></nuxeo-error>
      `,
    );
    await flush();

    nuxeoError.hide();
    expect(isElementVisible(nuxeoError)).to.be.false;
    expect(isElementVisible(nuxeoError.shadowRoot.querySelector('.code'))).to.be.false;
    expect(isElementVisible(nuxeoError.shadowRoot.querySelector('.description'))).to.be.false;
    expect(isElementVisible(nuxeoError.shadowRoot.querySelector('.url'))).to.be.false;
    expect(isElementVisible(nuxeoError.shadowRoot.querySelector('.message'))).to.be.false;
  });
});
