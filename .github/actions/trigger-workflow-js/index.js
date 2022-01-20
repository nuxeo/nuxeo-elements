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

    const octokit = github.getOctokit(access_token);
    const context = github.context;

    // trigger the remote workflow using the dispatch event
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref: branch_name,
      inputs: {
        branch_name,
        sauce_labs: 'true',
        skip_ftests: 'false',
        skip_a11y: 'false',
        skip_unit_tests: 'false',
        generate_metrics: 'false',
        run_all: 'false',
        bail: '0',
        id: `${context.runId}`,
      },
    });

    await sleep(10000);
    core.startGroup('Get workflow run id');
    // get the run that was triggered based on the context.runId
    let runs = await getWorkflowRuns(owner, repo, workflow_id, octokit);
    let i = 0;
    let run;
    let activeRun;
    let step = {};
    do {
      await sleep(2000);
      activeRun = runs[i++]; // get the last run
      let { data: wfJobs } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: activeRun.id,
      });

      // get the id job
      const job = wfJobs.jobs.find((j) => j.name === `Workflow ID ${context.runId}`);
      // console.log(job);
      if (job) {
        run = activeRun;
        // console.log(job);
        // step = job.steps.find((s) => s.name === `${context.runId}`);
        // if (step) {
        //   console.log('Found the step');
        //   break;
        // }
      }
      // if (job && job.status === 'completed') {
      //   console.log(job);
      //   step = job.steps.find((s) => s.name === `${context.runId}`);
      //   if (step) {
      //     console.log('Found the step');
      //     break;
      //   }
      // }
      //  else {
      //   // continue with the same run, until the job completes
      //   --i;
      // }
    } while (runs.length > i);
    // TODO - if no run is found, we might need to fail the action
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
