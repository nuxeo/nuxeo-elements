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
  /** Bulk actions contributed by `nuxeo-platform-csv-export`, one per population. */
  const USER_ACTION = 'userCSVExport';
  const GROUP_ACTION = 'groupCSVExport';

  /**
   * Numbers the snackbar each run owns. Module scope, not per element: the search screen and the group
   * details screen each hold a dialog, and a per-element counter would give both the same first key.
   */
  let runCount = 0;

  /**
   * The exports the Users & Groups screens offer. `members` yields two files: the server exposes member
   * users and member groups as two homogeneous populations, with no mixed projection.
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
      // raw, like every other group path in these screens: nuxeo-resource percent-encodes the path and
      // restores '/', so encoding here would be applied twice and any such group would 404
      requests: (groupname) => [
        { path: `group/${groupname}/@users/bulk/${USER_ACTION}` },
        { path: `group/${groupname}/@groups/bulk/${GROUP_ACTION}` },
      ],
    },
  };

  /**
   * Used by `nuxeo-user-group-management` and `nuxeo-group-management`.
   *
   * Asks for the export format and runs the server-side export, downloading the file it produces. The
   * exports are bulk actions, so the contract is asynchronous: the endpoint returns a command id, the
   * command is polled until it completes, and the blob it assembled is then downloaded.
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
        <nuxeo-resource id="abortRequest"></nuxeo-resource>

        <nuxeo-dialog id="dialog" with-backdrop aria-labelledby="exportHeading">
          <h2 id="exportHeading">[[i18n(_titleKey)]]</h2>
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
         * The selected format. It does not parameterise the request: the server exposes one bulk action
         * per format, so the format is carried by the action id in `EXPORTS`, not by a command parameter.
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
      // dropping the scheduled poll is not enough: a request already in flight would still resolve and
      // restart polling or download a file against a dialog that has left the page
      this._cancelRun();
      this._closeProgress();
      this._forgetAbort();
      this._pollingCommandId = null;
      this._setExporting(false);
    }

    /**
     * Takes down the run's "Exporting..." snackbar. It is sticky, and only the outcome replaces it, so a
     * run cut short by teardown would otherwise leave it claiming an export that is no longer running.
     */
    _closeProgress() {
      if (this._progressNotified && this._notificationKey) {
        this.notify({ commandId: this._notificationKey, close: true });
      }
      this._progressNotified = false;
      this._notificationKey = null;
    }

    /** Leaves nothing asked for: starts a run clean, and undoes a request the server refused. */
    _forgetAbort() {
      this._abortRequested = false;
      this._abortPending = null;
    }

    /** Invalidates whatever run is in progress, so none of its continuations do any more work. */
    _cancelRun() {
      this._runToken = (this._runToken || 0) + 1;
      this._stopPolling();
      // cancelling between two polls drops the scheduled tick, leaving nothing to notice the run was
      // invalidated; settling the poll promise here is what ends it
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
      // One snackbar for the whole click: a member export runs two commands, but the user asked for one
      // thing, so progress and the outcome share a key and replace each other.
      runCount += 1;
      const notification = `ugexport${runCount}`;
      this._forgetAbort();
      this._progressNotified = false;
      // held so teardown can take the snackbar down, since only the outcome would otherwise replace it
      this._notificationKey = notification;
      // names what was asked for, not the populations it is split across: "group members", not member
      // users then member groups
      const label = this._subjectLabel(definition.subject);
      // held across the abort being settled, which is what the outcome is reported with
      let outcomes;
      return this._runEach(requests, token, notification, label)
        .then((collected) => {
          outcomes = collected;
          // the run calls itself aborted only once the server has agreed to stop it
          return this._settleAbort(token);
        })
        .then((aborted) => {
          if (this._isCurrentRun(token)) {
            // replaces the progress snackbar, so there is nothing left for teardown to close
            this._reportOutcome(outcomes, label, notification, aborted);
            this._notificationKey = null;
            this._setExporting(false);
          }
        })
        .catch((error) => {
          if (this._isCurrentRun(token)) {
            this._notificationKey = null;
            this._setExporting(false);
          }
          throw error;
        });
    }

    /**
     * Runs the requests one after the other, collecting what each did. Sequential because they share the
     * dialog's resources, and because browsers accept consecutive downloads more readily than a burst.
     */
    _runEach(requests, token, notification, label) {
      const outcomes = [];
      // chained rather than looped: recursing keeps the sequence without an await inside a loop
      const next = (index) => {
        if (index >= requests.length || !this._isCurrentRun(token)) {
          return Promise.resolve(outcomes);
        }
        // an abort stops a member run short of its second population — but only once the server has
        // accepted it, since skipping on the click alone would lose half the export for nothing
        if (this._abortRequested) {
          return this._settleAbort(token).then((aborted) => (aborted ? outcomes : next(index)));
        }
        return this._run(requests[index], token, notification, label).then((outcome) => {
          outcomes.push(outcome);
          // a command stopped elsewhere — another tab, or the bulk API — ends the run just as a click
          // here would; going on would download the second population under an aborted outcome
          if (outcome === 'aborted') {
            return outcomes;
          }
          return next(index + 1);
        });
      };
      return next(0);
    }

    /** Submits one export, waits for it, and downloads the file it produced. */
    _run(request, token, notification, label) {
      let commandId;
      this.$.request.path = request.path;
      this.$.request.data = {};
      // nothing is being polled while this is submitted, and an abort clicked now must not go to the
      // previous population's finished command; `_poll` forwards it once the server names this one
      this._pollingCommandId = null;
      return this.$.request
        .post()
        .then((status) => {
          commandId = status && status.commandId;
          return this._isCurrentRun(token) ? this._poll(commandId, label, token, notification) : null;
        })
        .then((status) => {
          if (!status || !this._isCurrentRun(token)) {
            return null;
          }
          // an abort and the command finishing on its own can cross; only the server's answer says which
          // won, and so whether the file it assembled is handed over
          return this._settleAbort(token).then((aborted) =>
            this._isCurrentRun(token) ? this._onCompleted(status, aborted) : null,
          );
        })
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
    _reportOutcome(outcomes, label, notification, aborted) {
      const done = outcomes.filter(Boolean);
      if (done.length === 0 && !aborted) {
        return;
      }
      let key = 'userGroupExport.completed';
      if (done.includes('failed')) {
        key = 'userGroupExport.error';
      } else if (aborted || done.includes('aborted')) {
        key = 'userGroupExport.aborted';
      } else if (done.every((outcome) => outcome === 'empty')) {
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
        // Only ever disarms its own poll: a response from a run the dialog has moved past still settles,
        // and clearing unconditionally would take away the live run's handle, leaving it pending for good.
        const release = () => {
          if (this._cancelPoll === cancel) {
            this._cancelPoll = null;
          }
          if (this._pollingCommandId === commandId) {
            this._pollingCommandId = null;
          }
        };
        const settle = (value) => {
          release();
          resolve(value);
        };
        const fail = (error) => {
          release();
          reject(error);
        };
        // handed to _cancelRun so a disconnect while the next tick is merely scheduled still ends this poll
        const cancel = () => settle(null);
        this._cancelPoll = cancel;
        // the run's one notification outlives each command, so the abort action looks this up
        this._pollingCommandId = commandId;
        // an abort clicked while this command was being submitted had nothing to name; passing it on now
        // is what stops the command the user meant to stop
        if (this._abortRequested && !this._abortPending) {
          this._sendAbort(commandId);
        }
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
                // an error payload or unparseable body would otherwise read as "still running" and be
                // polled for ever
                fail(new Error(`Unexpected response polling bulk command ${commandId}`));
              } else if (this._isRunning(status)) {
                // Announced once per run, not per poll: Web UI re-reads the snackbar into its live region
                // on every notification, so repeating it each second would talk over the user for the
                // length of the export. An abort on its way is not announced, its outcome being imminent.
                if (!this._abortRequested && !this._progressNotified) {
                  this._progressNotified = true;
                  this._notifyProgress(label, notification, token);
                }
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
     * Says the export is still going. Carries no numbers: the bulk status leaves `processed` at 0 until
     * the command finishes, so a fraction would sit frozen and read as a stuck export.
     */
    _notifyProgress(label, notification, token) {
      this.notify({
        message: this.i18n('userGroupExport.poll', label),
        commandId: notification,
        // Web UI puts an Abort action on the snackbar whenever one is supplied. It reads the command at
        // click time rather than closing over one, a member export moving on to a second command behind
        // this notification — but only for the run that raised it, so a snackbar left over from an
        // earlier export cannot stop the one running now.
        abort: () => (this._isCurrentRun(token) ? this._abort(this._pollingCommandId) : Promise.resolve()),
        dismissible: true,
        duration: 0,
      });
    }

    /**
     * Asks the server to stop the command. The run is not ended here: the next poll sees `ABORTED` and
     * settles, which is what reports the outcome and releases the dialog.
     */
    _abort(commandId) {
      this._abortRequested = true;
      if (!commandId || this._abortPending) {
        // either nothing is being polled yet — `_poll` sends the request on once it has an id — or one
        // is already on its way
        return this._abortPending || Promise.resolve();
      }
      return this._sendAbort(commandId);
    }

    /** Puts the abort to the server, recording it so the run can wait for the answer. */
    _sendAbort(commandId) {
      this.$.abortRequest.path = `bulk/${commandId}/abort`;
      this._abortPending = this.$.abortRequest
        .put()
        .then(() => true)
        .catch((error) => {
          console.warn(`User/group export abort failed: ${error}`);
          return false;
        });
      return this._abortPending;
    }

    /**
     * Resolves with whether the run was really stopped — `true` only once the server has taken the abort.
     * A refusal stopped nothing, so it is withdrawn and the run carries on as if it had never been made.
     */
    _settleAbort(token) {
      if (!this._abortRequested) {
        return Promise.resolve(false);
      }
      // no command was ever submitted to stop, so the request stands unopposed
      return (this._abortPending || Promise.resolve(true)).then((accepted) => {
        if (!this._isCurrentRun(token)) {
          return false;
        }
        if (!accepted) {
          this._forgetAbort();
        }
        return accepted;
      });
    }

    _isBulkStatus(status) {
      return !!status && status['entity-type'] === 'bulkStatus';
    }

    /**
     * Only the three in-flight states keep the poll going. An allow-list rather than "not COMPLETED and
     * not ABORTED": an expired command reports `UNKNOWN`, which the negative form polls for ever.
     */
    _isRunning(status) {
      const state = status && status.state;
      return state === 'SCHEDULED' || state === 'SCROLLING_RUNNING' || state === 'RUNNING';
    }

    /**
     * Downloads whatever the command produced and says what happened, for `_reportOutcome` to sum up.
     * `aborted` says the server took an abort for this command, overriding the state the last poll read.
     */
    _onCompleted(status, aborted) {
      const result = (status && status.result) || {};
      const state = status && status.state;
      if (state === 'ABORTED' || aborted) {
        // the command may have finished and left a file behind, the abort and the final poll having
        // crossed; downloading it under a snackbar that says "aborted" is not what was asked for
        return 'aborted';
      }
      // UNKNOWN, and any terminal state the server may add later, left no file behind and must not be
      // read as an empty population
      if (state !== 'COMPLETED') {
        return 'failed';
      }
      // a command reaches COMPLETED even when entries failed, and its blob is then missing those rows;
      // the partial file is reported as a failure rather than handed over as if it were the population
      if (this._hasFailed(status)) {
        return 'failed';
      }
      if (!result.url) {
        // nothing matched, so no blob was assembled
        return 'empty';
      }
      this._triggerDownload(this._absoluteUrl(result.url));
      return 'downloaded';
    }

    /**
     * `true` when the command reported errors, or matched entries yet produced no blob — only a command
     * that matched nothing legitimately completes without one.
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
     * Downloads the blob straight from the server, so a whole-population export streams rather than
     * being buffered in the page. The server's `Content-Disposition` names the file and wins over a
     * `download` attribute, so none is set here.
     */
    _triggerDownload(url) {
      const a = document.createElement('a');
      a.style.display = 'none';
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
