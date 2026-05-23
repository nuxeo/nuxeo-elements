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
import { waitChanged, fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document.js';

suite('nuxeo-document', () => {
  const responseHeaders = {
    json: { 'Content-Type': 'application/json' },
    plain: { 'Content-Type': 'text/plain' },
  };

  let server;
  setup(() => {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
    server.respondWith('GET', '/json/cmis', [200, responseHeaders.json, '{}']);
    server.respondWith('POST', '/api/v1/automation/login', [
      200,
      responseHeaders.json,
      '{"entity-type":"login","username":"Administrator"}',
    ]);
    server.respondWith('GET', '/api/v1/user/Administrator', [
      200,
      responseHeaders.json,
      '{"entity-type":"login","username":"Administrator"}',
    ]);
    const Nuxeo = window.Nuxeo || {};
    Nuxeo.UI = {
      app: {
        $: {
          nxcon: {
            url: '/nuxeo',
          },
        },
      },
    };
  });

  teardown(() => {
    server.restore();
  });

  suite('when retrieving documents', () => {
    document.documentData = {
      properties: {
        'file:content': {
          appLinks: [],
          data: '/nuxeo/file1.jpeg?changeToken=13-0',
          digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '5763',
          'mime-type': 'image/jpeg',
          name: 'kitten1 (4).jpeg',
        },
        'files:files': [
          {
            file: {
              data: '/nuxeo/file2.jpeg?changeToken=13-0',
            },
          },
        ],
        'vid:transcodedVideos': [
          {
            content: {
              data: 'vid1.mp4?changeToken=9-0',
              'mime-type': 'video/mp4',
            },
            info: {
              width: 66,
              height: 66,
              format: 'jpeg',
            },
            name: 'vid1.mp4',
          },
        ],
      },
      contextParameters: {
        renditions: [
          {
            url: 'd287f/@rendition/pdf',
            icon: 'pdf.png',
            name: 'pdf',
            kind: null,
          },
        ],
        preview: {
          url: 'd287f/@preview/?changeToken=18-0',
        },
      },
    };

    test('should retrieve something valid', async () => {
      server.respondWith('GET', '/api/v1/path/something', [
        200,
        responseHeaders.json,
        '{"entity-type":"login","username":"Administrator"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );

      try {
        await document.get();
      } catch (_) {
        throw new Error('Expected to a valid response!');
      }
    });

    // This test fails on firefox due to the 'error' event fired in component
    // https://github.com/webcomponents/webcomponentsjs/issues/138
    test("shouldn't retrieve something invalid", async () => {
      server.respondWith('GET', '/api/v1/path/something', [
        500,
        responseHeaders.json,
        '{"message":"Internal Server Error"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      document.documentData = {
        properties: {
          'file:content': {
            appLinks: [],
            data: '/nuxeo/file1.jpeg?changeToken=13-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'image/jpeg',
            name: 'kitten1 (4).jpeg',
          },
          'vid:transcodedVideos': [
            {
              content: {
                data: 'vid1.mp4?changeToken=9-0',
                'mime-type': 'video/mp4',
              },
              info: {
                width: 66,
                height: 66,
                format: 'jpeg',
              },
              name: 'vid1.mp4',
            },
          ],
        },
        schemas: [
          {
            name: 'video',
          },
        ],
        contextParameters: {
          renditions: [
            {
              url: 'd287f/@rendition/pdf',
              icon: 'pdf.png',
              name: 'pdf',
              kind: null,
            },
          ],
          preview: {
            url: 'd287f/@preview/?changeToken=18-0',
          },
        },
      };
      try {
        await document.get();
      } catch (error) {
        expect(error.message).to.be.eq('Internal Server Error');
        return;
      }

      throw new Error('Expected to an invalid response!');
    });

    test('should tell it is loading', async () => {
      server.respondWith('GET', '/api/v1/id/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"document"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-id="something"></nuxeo-document>
        `,
      );

      expect(document.loading).to.be.false;

      document.get();

      expect(document.loading).to.be.true;

      // wait for loading state to toggle on and off
      await waitChanged(document, 'loading');

      expect(document.loading).to.be.false;
    });
  });

  suite('when generating the path', () => {
    test('should build a path from an id', async () => {
      const document = await fixture(
        html`
          <nuxeo-document doc-id="something"></nuxeo-document>
        `,
      );
      expect(document.path).to.be.eq('/id/something');
    });

    test('should build a path from a path', async () => {
      const document = await fixture('<nuxeo-document doc-path="something"></nuxeo-document>');
      expect(document.path).to.be.eq('/path/something');
    });
  });

  suite('http method helpers', () => {
    setup(() => {
      server.respondWith('POST', '/api/v1/path/something', [200, responseHeaders.json, '{"ok":true}']);
      server.respondWith('PUT', '/api/v1/path/something', [200, responseHeaders.json, '{"ok":true}']);
      server.respondWith('DELETE', '/api/v1/path/something', [200, responseHeaders.json, '{}']);
    });

    test('post creates the document with POST verb', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      doc.data = { 'entity-type': 'document', name: 'foo' };
      await doc.post();
      const last = server.requests.find((r) => r.method === 'POST' && r.url.endsWith('/path/something'));
      expect(last).to.exist;
    });

    test('put updates the document with PUT verb', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      await doc.put();
      const last = server.requests.find((r) => r.method === 'PUT' && r.url.endsWith('/path/something'));
      expect(last).to.exist;
    });

    test('remove deletes the document with DELETE verb', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      await doc.remove();
      const last = server.requests.find((r) => r.method === 'DELETE' && r.url.endsWith('/path/something'));
      expect(last).to.exist;
    });
  });

  suite('files:files response handling', () => {
    setup(() => {
      server.respondWith('GET', '/api/v1/path/files-doc', [
        200,
        responseHeaders.json,
        JSON.stringify({
          properties: {
            'files:files': [{ file: { data: '/nuxeo/file-a.txt' } }, { file: { data: '/nuxeo/file-b.txt' } }],
          },
        }),
      ]);
    });

    test('appends clientReason for entries inside files:files', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="files-doc"></nuxeo-document>
        `,
      );
      await doc.get();
      expect(doc.documentData.properties['files:files'][0].file.viewUrl).to.contain('clientReason=view');
      expect(doc.documentData.properties['files:files'][0].file.downloadUrl).to.contain('clientReason=download');
    });
  });

  suite('setDocumentViewDownloadProp branches', () => {
    test('does nothing when documentData is empty', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      doc.documentData = null;
      expect(() => doc.setDocumentViewDownloadProp()).to.not.throw();
    });

    test('handles documentData without contextParameters or properties', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      doc.documentData = {};
      expect(() => doc.setDocumentViewDownloadProp()).to.not.throw();
    });

    test('appendClientReason uses url when only url field is present', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      const prop = { url: 'http://example.com/file' };
      doc.appendClientReason(prop);
      expect(prop.viewUrl).to.equal('http://example.com/file?clientReason=view');
      expect(prop.downloadUrl).to.equal('http://example.com/file?clientReason=download');
    });

    test('appendClientReason no-ops when neither url nor data is present', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      const prop = { other: 'value' };
      doc.appendClientReason(prop);
      expect(prop.viewUrl).to.be.undefined;
      expect(prop.downloadUrl).to.be.undefined;
    });
  });

  suite('_computePath fallback', () => {
    test('returns empty path when neither docId nor docPath is set', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document></nuxeo-document>
        `,
      );
      expect(doc.path).to.equal('');
    });
  });

  suite('response listener edge cases', () => {
    test('clears documentData when the resource response has no detail', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      doc.documentData = { previous: true };
      doc.$.nxResource.dispatchEvent(new CustomEvent('response', { bubbles: true, composed: true, detail: null }));
      expect(doc.documentData).to.be.null;
    });

    test('does not append clientReason when file:content has no data', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-id="x"></nuxeo-document>
        `,
      );
      doc.$.nxResource.dispatchEvent(
        new CustomEvent('response', {
          bubbles: true,
          composed: true,
          detail: { response: { properties: { 'file:content': { 'mime-type': 'text/plain' } } } },
        }),
      );
      expect(doc.documentData.properties['file:content']).to.not.have.property('viewUrl');
    });
  });

  suite('isFollowRedirectEnabled', () => {
    setup(() => {
      Nuxeo.UI = Nuxeo.UI || {};
      Nuxeo.UI.config = Nuxeo.UI.config || {};
      Nuxeo.UI.config.url = Nuxeo.UI.config.url || {};
    });
    teardown(() => {
      delete Nuxeo.UI.config.url.followRedirect;
    });

    test('returns true when followRedirect is "true"', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="x"></nuxeo-document>
        `,
      );
      Nuxeo.UI.config.url.followRedirect = 'true';
      expect(doc.isFollowRedirectEnabled()).to.be.true;
    });

    test('returns false when followRedirect is unset', async () => {
      const doc = await fixture(
        html`
          <nuxeo-document doc-path="x"></nuxeo-document>
        `,
      );
      delete Nuxeo.UI.config.url.followRedirect;
      expect(doc.isFollowRedirectEnabled()).to.be.false;
    });
  });

  suite('when setting document view or download action', () => {
    test('should set view and download data', async () => {
      const document = await fixture(
        html`
          <nuxeo-document doc-id="something"></nuxeo-document>
        `,
      );
      document.documentData = {
        properties: {
          'file:content': {
            appLinks: [],
            data: 'file1.jpeg?changeToken=13-0',
            digest: '2e7d1a1ba7018c048bebdf1d07481ee3',
            digestAlgorithm: 'MD5',
            encoding: null,
            length: '5763',
            'mime-type': 'image/jpeg',
            name: 'kitten1 (4).jpeg',
          },
          'vid:transcodedVideos': [
            {
              content: {
                data: 'vid1.mp4?changeToken=9-0',
                'mime-type': 'video/mp4',
              },
              info: {
                width: 66,
                height: 66,
                format: 'jpeg',
              },
              name: 'vid1.mp4',
            },
          ],
        },
        schemas: [
          {
            name: 'video',
          },
        ],
        contextParameters: {
          renditions: [
            {
              url: 'd287f/@rendition/pdf',
              icon: 'pdf.png',
              name: 'pdf',
              kind: null,
            },
          ],
          preview: {
            url: 'd287f/@preview/?changeToken=18-0',
          },
        },
      };
      document.setDocumentViewDownloadProp();
      expect(document.documentData.properties['file:content'].viewUrl).to.eq(
        'file1.jpeg?changeToken=13-0&clientReason=view',
      );
      expect(document.documentData.properties['file:content'].downloadUrl).to.eq(
        'file1.jpeg?changeToken=13-0&clientReason=download',
      );
      expect(document.documentData.properties['vid:transcodedVideos'][0].content.viewUrl).to.eq(
        'vid1.mp4?changeToken=9-0&clientReason=view',
      );
      expect(document.documentData.properties['vid:transcodedVideos'][0].content.downloadUrl).to.eq(
        'vid1.mp4?changeToken=9-0&clientReason=download',
      );
      expect(document.documentData.contextParameters.renditions[0].viewUrl).to.eq(
        'd287f/@rendition/pdf?clientReason=view',
      );
      expect(document.documentData.contextParameters.renditions[0].downloadUrl).to.eq(
        'd287f/@rendition/pdf?clientReason=download',
      );
      expect(document.documentData.contextParameters.preview.viewUrl).to.eq(
        'd287f/@preview/?changeToken=18-0&clientReason=view',
      );
      expect(document.documentData.contextParameters.preview.downloadUrl).to.eq(
        'd287f/@preview/?changeToken=18-0&clientReason=download',
      );
    });
  });
});
