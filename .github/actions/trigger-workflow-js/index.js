const core = require('@actions/core');
const github = require('@actions/github');

function sleep(milliseconds) {
  return new Promise((r) => setTimeout(r, milliseconds));
}

async function getWorkflowRuns(owner, repo, workflow_id, octokit) {
  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id,
  });
  return runs.workflow_runs;
}

async function run() {
  try {
    const access_token = core.getInput('access-token');
    const workflow_id = core.getInput('workflow-id');
    const branch_name = core.getInput('branch-name');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const pollInterval = Number.parseInt(core.getInput('poll-interval'));
    const workflowInputs = core.getMultilineInput('inputs');

    const octokit = github.getOctokit(access_token);
    const context = github.context;

    // set runId for tracking purposes
    const srcRunID = `${context.runId}-${Date.now().toString()}`;
    let inputs = {
      id: srcRunID,
    };
    workflowInputs.forEach((input) => {
      const exprs = input.split(':');
      inputs[exprs[0].trim()] = `${exprs[1].trim()}`;
    });
    // trigger the remote workflow using the dispatch event
    console.log('Creating the workflow dispatch');
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref: branch_name,
      inputs,
    });
    console.log('Finished the workflow dispatch');

    await sleep(10000);
    core.startGroup('Get workflow run id');
    // get the run that was triggered based on the context.runId
    let runs = await getWorkflowRuns(owner, repo, workflow_id, octokit);
    let i = 0;
    let run;
    let activeRun;
    do {
      await sleep(2000);
      activeRun = runs[i++]; // get the last run
      let { data: wfJobs } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: activeRun.id,
      });

      // get the id job
      const job = wfJobs.jobs.find((j) => j.name === `Workflow ID ${srcRunID}`);
      if (job) {
        run = activeRun;
      }
    } while (runs.length > i);
    core.endGroup();

    if (!run) {
      core.setFailed(`No run was found for id ${context.runId}`);
    }

    // Output the run url to follow
    core.info(`\u001b[1mRun URL ${run.html_url}`);
    core.startGroup('Monitor remote workflow run');
    let conclusion = run.conclusion;
    let status = run.status;
    let runId = run.id;
    do {
      await sleep(pollInterval);

      // get the workflow run using the runId
      const runReq = await octokit.rest.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });
      run = runReq.data;
      conclusion = run.conclusion;
      status = run.status;
      core.info(`Workflow status: ${status}`);
    } while (conclusion === null && status !== 'completed');
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
