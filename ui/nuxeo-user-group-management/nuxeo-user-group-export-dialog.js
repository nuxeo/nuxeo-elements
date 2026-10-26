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
      subject: 'users',
      requests: () => [{ path: `user/search/bulk/${USER_ACTION}` }],
    },
    groups: {
      titleKey: 'userGroupExport.groups.heading',
      subject: 'groups',
      requests: () => [{ path: `group/search/bulk/${GROUP_ACTION}` }],
    },
    members: {
      titleKey: 'userGroupExport.members.heading',
      subject: 'members',
      // the group id is interpolated raw, as every other group path in these screens does: the client
      // percent-encodes the path it is given and puts '/' back, so a group named "managers/webui" keeps its
      // slash (Tomcat rejects %2F) while "mana?gers" still gets its '?' encoded. Encoding here would be
      // applied a second time and every such group would 404.
      requests: (groupname) => [
        { path: `group/${groupname}/@users/bulk/${USER_ACTION}` },
        { path: `group/${groupname}/@groups/bulk/${GROUP_ACTION}` },
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
      // Cancelling between two polls drops the scheduled tick, so nothing is left to notice the run was
      // invalidated: the poll promise, and the export chain awaiting it, would stay pending for good.
      // Settling it here is what ends the run.
      const settleCancelled = this._cancelPoll;
      this._cancelPoll = null;
      if (settleCancelled) {
        settleCancelled();
      }
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
      // One notification for the whole click. A member export runs two commands, but the user asked for one
      // thing, so progress and the outcome share a key and replace each other in a single snackbar instead of
      // announcing each population separately.
      const notification = `ugexport${token}`;
      // every message of this run names what was asked for, not the populations it happens to be split
      // across: "Exporting group members..." rather than member users then member groups
      const label = this._subjectLabel(definition.subject);
      return this._runEach(requests, token, notification, label)
        .then((outcomes) => {
          if (this._isCurrentRun(token)) {
            this._reportOutcome(outcomes, label, notification);
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

    /**
     * Runs the requests one after the other, collecting what each did. Sequential because they share the
     * dialog's resources, and because the browser is likelier to accept consecutive downloads than a burst
     * of simultaneous ones.
     */
    async _runEach(requests, token, notification, label) {
      const outcomes = [];
      for (let i = 0; i < requests.length && this._isCurrentRun(token); i++) {
        outcomes.push(await this._run(requests[i], token, notification, label));
      }
      return outcomes;
    }

    /** Submits one export, waits for it, and downloads the file it produced. */
    _run(request, token, notification, label) {
      // kept so a failure after polling began replaces the progress snackbar instead of opening a second
      // one beside it, leaving "Exporting..." on screen for a run that has already stopped
      let commandId;
      this.$.request.path = request.path;
      this.$.request.data = {};
      return this.$.request
        .post()
        .then((status) => {
          commandId = status && status.commandId;
          return this._isCurrentRun(token) ? this._poll(commandId, label, token, notification) : null;
        })
        .then((status) => (status && this._isCurrentRun(token) ? this._onCompleted(status) : null))
        .catch((error) => {
          // a run the dialog no longer owns has nobody to report to
          if (!this._isCurrentRun(token)) {
            return null;
          }
          console.warn(`User/group export failed: ${error}`);
          return 'failed';
        });
    }

    /** Sums up what every request of one export did, so the click gets a single answer. */
    _reportOutcome(outcomes, label, notification) {
      const done = outcomes.filter(Boolean);
      if (done.length === 0) {
        return;
      }
      let key = 'userGroupExport.completed';
      if (done.includes('failed')) {
        key = 'userGroupExport.error';
      } else if (done.includes('aborted')) {
        key = 'userGroupExport.aborted';
      } else if (done.every((outcome) => outcome === 'empty')) {
        // every population the export covers was empty, so no file was produced at all
        key = 'userGroupExport.empty';
      }
      this.notify({ message: this.i18n(key, label), commandId: notification, dismissible: true });
    }

    _subjectLabel(subject) {
      return this.i18n(`userGroupExport.subject.${subject}`);
    }

    /**
     * Resolves with the final status of the command, polling until it is no longer in flight. Resolves with
     * `null` instead if the run was cancelled, so the caller settles without acting on a stale response.
     */
    _poll(commandId, label, token, notification) {
      return new Promise((resolve, reject) => {
        const settle = (value) => {
          this._cancelPoll = null;
          resolve(value);
        };
        const fail = (error) => {
          this._cancelPoll = null;
          reject(error);
        };
        // handed to _cancelRun so a disconnect while the next tick is merely scheduled still ends this poll
        this._cancelPoll = () => settle(null);
        const tick = () => {
          if (!this._isCurrentRun(token)) {
            settle(null);
            return;
          }
          this.$.status.path = `bulk/${commandId}`;
          this.$.status
            .get()
            .then((status) => {
              if (!this._isCurrentRun(token)) {
                settle(null);
              } else if (!this._isBulkStatus(status)) {
                // anything else (an error payload, an unparseable body) would be read as "still running"
                // and polled forever, so it ends the run instead
                fail(new Error(`Unexpected response polling bulk command ${commandId}`));
              } else if (this._isRunning(status)) {
                this._notifyProgress(label, notification);
                this._pollTimeout = window.setTimeout(tick, this.pollInterval);
              } else {
                settle(status);
              }
            })
            .catch(fail);
        };
        tick();
      });
    }

    /**
     * Says the export is still going. Deliberately carries no numbers: the bulk status leaves `processed`
     * at 0 until the command finishes, so a fraction would sit frozen and read as a stuck export, and the
     * size on its own only repeats what the completion message reports a moment later. Keyed on the run so
     * each update replaces the same snackbar.
     */
    _notifyProgress(label, notification) {
      this.notify({
        message: this.i18n('userGroupExport.poll', label),
        commandId: notification,
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

    /** Downloads whatever the command produced and says what happened, for `_reportOutcome` to sum up. */
    _onCompleted(status) {
      const result = (status && status.result) || {};
      if (status && status.state === 'ABORTED') {
        return 'aborted';
      }
      // A command reaches COMPLETED even when entries failed, and the blob it assembled is then missing those
      // rows. `nuxeo-operation` rejects on the same fields rather than treating such a status as a success, so
      // the partial file is reported as a failure instead of being handed over as if it were the population.
      if (this._hasFailed(status)) {
        return 'failed';
      }
      if (!result.url) {
        // nothing matched, so no blob was assembled and there is nothing to download
        return 'empty';
      }
      this._triggerDownload(this._absoluteUrl(result.url));
      return 'downloaded';
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
