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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-select.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element to start an workflow on a document.
   *
   * Example:
   *
   *     <nuxeo-workflow-button document="[[document]]"></nuxeo-workflow-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-workflow-button/index.html
   */
  class WorkflowButton extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      nuxeo-select {
        max-width: 380px;
      }
    </style>

    <nuxeo-resource id="workflows" path="/id/[[document.uid]]/@workflow"></nuxeo-resource>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_toggleDialog">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>

        <nuxeo-dialog id="dialog" with-backdrop="">
          <h2>[[i18n('workflowButton.dialog.heading')]]</h2>

          <nuxeo-select
            label="[[i18n('workflowButton.dialog.placeholder')]]"
            selected="{{selectedProcess}}"
            attr-for-selected="key">
            <dom-repeat items="[[processes]]" as="process">
              <template>
                <paper-item key="[[process.workflowModelName]]">[[i18n(process.title)]]</paper-item>
              </template>
            </dom-repeat>
          </nuxeo-select>

          <div class="buttons">
            <paper-button dialog-dismiss="">[[i18n('workflowButton.dialog.close')]]</paper-button>
            <paper-button
              id="startButton"
              class="primary"
              disabled="[[!selectedProcess]]"
              on-click="_startWorkflow">[[i18n('workflowButton.dialog.start')]]</paper-button>
          </div>
        </nuxeo-dialog>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-workflow-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: {
          type: Object,
          observer: '_documentChanged',
        },

        processes: {
          type: Array,
        },

        selectedProcess: {
          type: String,
        },

        /* Running workflows on the document */
        workflows: {
          type: Object,
          observer: '_workflowsChanged',
        },

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:workflow',
        },

        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        _label: {
          type: String,
          computed: '_computeLabel(i18n)',
        },
      };
    }

    _isAvailable(document) {
      if (!document) {
        return false;
      }
      this.processes = document.contextParameters.runnableWorkflows;
      this.workflows = document.contextParameters.runningWorkflows;
      this.hasWorkflowRunning = this.workflows && this.workflows.length > 0;
      return document && !this.hasWorkflowRunning && this.processes && this.processes.length > 0;
    }

    _computeLabel() {
      return this.i18n('workflowButton.tooltip');
    }

    _toggleDialog() {
      this.$$('#startButton').removeAttribute('disabled');
      this.$$('#dialog').toggle();
    }

    _startWorkflow() {
      // disable start button to prevent starting multiple workflows
      this.$$('#startButton').setAttribute('disabled', true);
      this.workflows = this.$.workflows;
      this.$.workflows.data = {
        'entity-type': 'workflow',
        workflowModelName: this.selectedProcess,
        attachedDocumentIds: [this.document.uid],
      };

      this.workflows.post().then((workflow) => {
        this.dispatchEvent(new CustomEvent('workflowStarted', {
          composed: true,
          bubbles: true,
          detail: { workflow },
        }));
        this.$$('#dialog').toggle();
      });
    }

    _workflowsChanged() {
      this.hasWorkflowRunning = this.workflows && this.workflows.length > 0;
    }

    _documentChanged() {
      if (this.document) {
        this.processes = this.document.contextParameters.runnableWorkflows;
        this.workflows = this.document.contextParameters.runningWorkflows;
        this.selectedProcess = this.processes.length > 0 ? this.processes[0].workflowModelName : null;
      }
    }
  }

  customElements.define(WorkflowButton.is, WorkflowButton);
  Nuxeo.WorkflowButton = WorkflowButton;
}
