/**
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
const core = require('@actions/core');
const github = require('@actions/github');

let octokit;

function sleep(milliseconds) {
  return new Promise((r) => setTimeout(r, milliseconds));
}

/**
 * Get the workflow runs for the provided workflow id.
 */
async function getWorkflowRuns(owner, repo, workflowID) {
  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowID,
  });
  return runs.workflow_runs;
}

/**
 * Get the run that was triggered using the dispatch event.
 */
async function getWorkflowRun(owner, repo, workflowID, srcWfRunID) {
  await sleep(10000);

  let run;
  let activeRun;
  let i = 0;
  let runs = await getWorkflowRuns(owner, repo, workflowID);
  do {
    await sleep(2000);
    activeRun = runs[i++];
    let { data: wfJobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: activeRun.id,
    });

    // get the id job
    const job = wfJobs.jobs.find((j) => j.name === `Workflow ID ${srcWfRunID}`);
    if (job) {
      run = activeRun;
    }
  } while (runs.length > i);
  return run;
}

/**
 * Create a new workflow run using the dispatch event.
 */
async function dispatchWorkflowRun(owner, repo, workflowID, branchName, inputs) {
  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowID,
    ref: branchName,
    inputs,
  });
  core.info('Workflow run triggered successfully.');
}

/*
 * Wait for the workflow run to finish.
 */
async function waitForWorkflowRun(owner, repo, run, pollInterval) {
  let { conclusion, status, id} = run;
  do {
    await sleep(pollInterval);
    // get the workflow run using the id
    const runReq = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: id,
    });
    run = runReq.data;
    ({ conclusion, status } = run);
    core.info(`Workflow status: ${status}`);
    core.info(`Check run details ${run.html_url}`);
  } while (conclusion === null && status !== 'completed');
  return { conclusion, status };
}

async function run() {
  try {
    // Get the action inputs.
    const accessToken = core.getInput('access-token');
    const workflowID = core.getInput('workflow-id');
    const branchName = core.getInput('branch-name');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const pollInterval = Number.parseInt(core.getInput('poll-interval'));
    const workflowInputs = core.getMultilineInput('inputs');

    // create a octokit instance with the provided access token
    octokit = github.getOctokit(accessToken);
    const context = github.context;

    // set runId for tracking purposes
    const srcWfRunID = `${context.runId}-${Date.now().toString()}`;
    // setup the workflow inputs
    let inputs = {
      id: srcWfRunID,
    };
    workflowInputs.forEach((input) => {
      const exprs = input.split(':');
      inputs[exprs[0].trim()] = `${exprs[1].trim()}`;
    });

    // trigger the remote workflow using the dispatch event
    await dispatchWorkflowRun(owner, repo, workflowID, branchName, inputs);

    // get the run we just created using the dispatch event
    let run = await getWorkflowRun(owner, repo, workflowID, srcWfRunID);
    if (!run) {
      core.setFailed(`No run was found for id ${context.runId}`);
      return;
    }
    core.info(`\u001b[1mRun URL ${run.html_url}`);

    // wait for the called workflow to finish
    core.startGroup('Workflow run in progress');
    const { conclusion, status } = await waitForWorkflowRun(owner, repo, run, pollInterval);
    core.endGroup();

    if (conclusion === 'success' && status === 'completed') {
      core.info(`Workflow ${status} with ${conclusion}`);
    } else {
      core.setFailed(`Workflow ${status} with ${conclusion}.`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
