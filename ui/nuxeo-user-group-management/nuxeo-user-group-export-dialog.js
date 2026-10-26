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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import { NotifyBehavior } from '@nuxeo/nuxeo-elements/nuxeo-notify-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-dialog.js';
import '../nuxeo-button-styles.js';

{
  /**
   * The bulk actions contributed by `nuxeo-platform-csv-export`, one per population. A population is always fixed by
   * the resource the action is posted to, never by a client parameter.
   */
  const USER_ACTION = 'userCSVExport';
  const GROUP_ACTION = 'groupCSVExport';

  /**
   * Describes each export offered by the Users & Groups screens: the dialog heading and the bulk endpoints to post
   * to. `members` yields two files because the server exposes the member users and the member groups as two
   * homogeneous populations (`@users` and `@groups`), with no mixed projection.
   */
  const EXPORTS = {
    users: {
      titleKey: 'userGroupExport.users.heading',
      requests: () => [{ path: `user/search/bulk/${USER_ACTION}`, subject: 'users' }],
    },
    groups: {
      titleKey: 'userGroupExport.groups.heading',
      requests: () => [{ path: `group/search/bulk/${GROUP_ACTION}`, subject: 'groups' }],
    },
    members: {
      titleKey: 'userGroupExport.members.heading',
      // the group id is interpolated raw, as every other group path in these screens does: the client
      // percent-encodes the path it is given and puts '/' back, so a group named "managers/webui" keeps its
      // slash (Tomcat rejects %2F) while "mana?gers" still gets its '?' encoded. Encoding here would be
      // applied a second time and every such group would 404.
      requests: (groupname) => [
        { path: `group/${groupname}/@users/bulk/${USER_ACTION}`, subject: 'memberUsers' },
        { path: `group/${groupname}/@groups/bulk/${GROUP_ACTION}`, subject: 'memberGroups' },
      ],
    },
  };

  /**
   * Used by `nuxeo-user-group-management` and `nuxeo-group-management`.
   *
   * Asks for the export format and runs the corresponding server-side export, downloading the file it produces. The
   * exports are bulk actions, so the contract is asynchronous: the endpoint returns a command id, the command is
   * polled until it completes, and the blob it assembled is then downloaded. A command that matched nothing completes
   * with no blob at all, which is reported rather than waited on.
   *
   * Example:
   *
   *     <nuxeo-user-group-export-dialog id="export"></nuxeo-user-group-export-dialog>
   *     ...
   *     this.$.export.open('members', 'administrators');
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.NotifyBehavior
   * @memberof Nuxeo
   */
  class UserGroupExportDialog extends mixinBehaviors([I18nBehavior, NotifyBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="iron-flex iron-flex-alignment nuxeo-button-styles">
          :host {
            display: block;
          }

          .format {
            margin: 0.5em 0 1em;
          }

          .format-label {
            display: block;
            margin-bottom: 0.5em;
            opacity: 0.75;
          }
        </style>

        <nuxeo-connection id="nx"></nuxeo-connection>
        <nuxeo-resource id="request" content-type="application/json"></nuxeo-resource>
        <nuxeo-resource id="status"></nuxeo-resource>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n(_titleKey)]]</h2>
          <div class="format">
            <span class="format-label" id="formatLabel">[[i18n('userGroupExport.format')]]</span>
            <paper-radio-group selected="{{format}}" aria-labelledby="formatLabel">
              <dom-repeat items="[[formats]]" as="fmt">
                <template>
                  <paper-radio-button name="[[fmt]]">[[_formatLabel(fmt)]]</paper-radio-button>
                </template>
              </dom-repeat>
            </paper-radio-group>
          </div>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink dialog-dismiss class="secondary">[[i18n('command.cancel')]]</paper-button>
            </div>
            <paper-button id="exportConfirmButton" noink class="primary" on-click="_export" disabled$="[[exporting]]">
              [[i18n('userGroupExport.command.export')]]
            </paper-button>
          </div>
        </nuxeo-dialog>
      `;
    }

    static get is() {
      return 'nuxeo-user-group-export-dialog';
    }

    static get properties() {
      return {
        /**
         * What to export: `users`, `groups` or `members`. `members` additionally requires `groupname`.
         */
        exportType: {
          type: String,
          value: 'users',
        },

        /**
         * The group whose members are exported, when `exportType` is `members`.
         */
        groupname: {
          type: String,
        },

        /**
         * The formats offered in the dialog. Only CSV is produced by the server for now; adding a format here is
         * enough as long as the corresponding `userGroupExport.format.<format>` label exists.
         */
        formats: {
          type: Array,
          value: () => ['csv'],
        },

        /**
         * The selected format. It does not parameterise the request: the server exposes one bulk action per
         * format, and `csvExport` is the only one it contributes today, so the format is carried by the action id
         * in `EXPORTS` rather than by a command parameter.
         */
        format: {
          type: String,
          value: 'csv',
        },

        /**
         * The interval at which the export command is polled, in milliseconds.
         */
        pollInterval: {
          type: Number,
          value: 1000,
        },

        /**
         * `true` while an export is being prepared, so the dialog cannot submit the same export twice.
         */
        exporting: {
          type: Boolean,
          value: false,
          notify: true,
          readOnly: true,
        },

        _titleKey: {
          type: String,
          computed: '_computeTitleKey(exportType)',
        },
      };
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      // Dropping the scheduled poll is not enough: a submission or a status request already in flight will
      // still resolve, and would restart polling, download a file, or start the next member export against a
      // dialog that is no longer on the page. Invalidating the run makes every continuation check that it
      // still owns the dialog first.
      this._cancelRun();
      this._setExporting(false);
    }

    /** Invalidates whatever run is in progress, so none of its continuations do any more work. */
    _cancelRun() {
      this._runToken = (this._runToken || 0) + 1;
      this._stopPolling();
    }

    _isCurrentRun(token) {
      return this._runToken === token;
    }

    /**
     * Opens the dialog for the given export.
     *
     * @param {string} exportType one of `users`, `groups` or `members`
     * @param {string} groupname the group to export the members of, when exporting members
     */
    open(exportType, groupname) {
      if (exportType) {
        this.exportType = exportType;
      }
      this.groupname = groupname;
      this.format = this.formats[0];
      this.$.dialog.open();
    }

    _computeTitleKey(exportType) {
      const definition = EXPORTS[exportType];
      return definition ? definition.titleKey : '';
    }

    _formatLabel(format) {
      return this.i18n(`userGroupExport.format.${format}`);
    }

    _export() {
      const definition = EXPORTS[this.exportType];
      // `members` is the only export bound to one group; without it there is no population to ask for
      if (!definition || this.exporting || (this.exportType === 'members' && !this.groupname)) {
        return Promise.resolve();
      }
      const requests = definition.requests(this.groupname);
      this.$.dialog.close();
      this._setExporting(true);
      const token = (this._runToken || 0) + 1;
      this._runToken = token;
      // run the requests one after the other: both share the dialog's resources, and the browser is likelier to
      // accept consecutive downloads than a burst of simultaneous ones
      return requests
        .reduce(
          (previous, request) => previous.then(() => (this._isCurrentRun(token) ? this._run(request, token) : null)),
          Promise.resolve(),
        )
        .then(() => {
          if (this._isCurrentRun(token)) {
            this._setExporting(false);
          }
        })
        .catch((error) => {
          if (this._isCurrentRun(token)) {
            this._setExporting(false);
          }
          throw error;
        });
    }

    /** Submits one export, waits for it, and downloads the file it produced. */
    _run(request, token) {
      const subject = this._subjectLabel(request.subject);
      this.$.request.path = request.path;
      this.$.request.data = {};
      return this.$.request
        .post()
        .then((status) => (this._isCurrentRun(token) ? this._poll(status.commandId, subject, token) : null))
        .then((status) => {
          if (status && this._isCurrentRun(token)) {
            this._onCompleted(status, subject);
          }
        })
        .catch((error) => {
          // a run the dialog no longer owns has nobody to report to
          if (!this._isCurrentRun(token)) {
            return;
          }
          console.warn(`User/group export failed: ${error}`);
          this.notify({ message: this.i18n('userGroupExport.error', subject), dismissible: true });
        });
    }

    _subjectLabel(subject) {
      return this.i18n(`userGroupExport.subject.${subject}`);
    }

    /**
     * Resolves with the final status of the command, polling until it is no longer in flight. Resolves with
     * `null` instead if the run was cancelled, so the caller settles without acting on a stale response.
     */
    _poll(commandId, subject, token) {
      return new Promise((resolve, reject) => {
        const tick = () => {
          if (!this._isCurrentRun(token)) {
            resolve(null);
            return;
          }
          this.$.status.path = `bulk/${commandId}`;
          this.$.status
            .get()
            .then((status) => {
              if (!this._isCurrentRun(token)) {
                resolve(null);
              } else if (!this._isBulkStatus(status)) {
                // anything else (an error payload, an unparseable body) would be read as "still running"
                // and polled forever, so it ends the run instead
                reject(new Error(`Unexpected response polling bulk command ${commandId}`));
              } else if (this._isRunning(status)) {
                this._notifyProgress(status, subject);
                this._pollTimeout = window.setTimeout(tick, this.pollInterval);
              } else {
                resolve(status);
              }
            })
            .catch(reject);
        };
        tick();
      });
    }

    /**
     * Reports how far the command has got. Keyed by the command id so every update replaces the same
     * snackbar rather than stacking one per poll, and so the final outcome lands on it too. Exporting the
     * whole population can take a while, and a run with no feedback reads as a stalled one.
     */
    _notifyProgress(status, subject) {
      this.notify({
        message:
          status.total > 0
            ? this.i18n('userGroupExport.progress', subject, status.processed, status.total)
            : this.i18n('userGroupExport.poll', subject),
        commandId: status.commandId,
        dismissible: true,
        duration: 0,
      });
    }

    _isBulkStatus(status) {
      return !!status && status['entity-type'] === 'bulkStatus';
    }

    _isRunning(status) {
      const state = status && status.state;
      return state !== 'COMPLETED' && state !== 'ABORTED';
    }

    _onCompleted(status, subject) {
      const result = (status && status.result) || {};
      const commandId = status && status.commandId;
      if (status && status.state === 'ABORTED') {
        this.notify({ message: this.i18n('userGroupExport.aborted', subject), commandId, dismissible: true });
        return;
      }
      // A command reaches COMPLETED even when entries failed, and the blob it assembled is then missing those
      // rows. `nuxeo-operation` rejects on the same fields rather than treating such a status as a success, so
      // the partial file is reported as a failure instead of being handed over as if it were the population.
      if (this._hasFailed(status)) {
        this.notify({ message: this.i18n('userGroupExport.error', subject), commandId, dismissible: true });
        return;
      }
      if (!result.url) {
        // nothing matched, so no blob was assembled and there is nothing to download
        this.notify({ message: this.i18n('userGroupExport.empty', subject), commandId, dismissible: true });
        return;
      }
      this.notify({ message: this.i18n('userGroupExport.completed', subject), commandId, dismissible: true });
      this._triggerDownload(this._absoluteUrl(result.url));
    }

    /**
     * `true` when the command reported errors, or when it matched entries yet produced no blob — only a
     * command that matched nothing legitimately completes without one.
     */
    _hasFailed(status) {
      if (!status) {
        return false;
      }
      const result = status.result || {};
      return !!status.error || status.errorCount > 0 || (!result.url && status.total > 0);
    }

    /** The bulk status carries a server path relative to the Nuxeo context, not a full URL. */
    _absoluteUrl(url) {
      const base = (this.$.nx.url || '').replace(/\/$/, '');
      return `${base}/${url}`;
    }

    /**
     * Downloads the assembled blob straight from the server, so an export of the whole population streams rather
     * than being buffered in the page. The file is named by the server, which serves the blob with
     * `Content-Disposition: attachment` — that header wins over a `download` attribute, so none is set here.
     */
    _triggerDownload(url) {
      const a = document.createElement('a');
      a.style = 'display: none';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    _stopPolling() {
      if (this._pollTimeout) {
        window.clearTimeout(this._pollTimeout);
        this._pollTimeout = null;
      }
    }
  }

  customElements.define(UserGroupExportDialog.is, UserGroupExportDialog);
  Nuxeo.UserGroupExportDialog = UserGroupExportDialog;
}
