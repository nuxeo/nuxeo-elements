const core = require('@actions/core');
const github = require('@actions/github');

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('who-to-greet');
//   console.log(`Hello ${nameToGreet}!`);
//   const time = new Date().toTimeString();
//   core.setOutput('time', time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2);
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }

function sleep(milliseconds) {
  return new Promise((r) => setTimeout(r, milliseconds));
}

async function getWorkflowRuns(owner, repo, workflow_id, octokit) {
  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id,
  });

  // console.log(data.workflow_runs);

  // return runs.workflow_runs[0];
  return runs.workflow_runs;
}

async function run() {
  try {
    const webui_access_token = core.getInput('webui-access-token');
    const branch_name = core.getInput('branch-name');

    const octokit = github.getOctokit(webui_access_token);

    const owner = 'nuxeo';
    const repo = 'nuxeo-web-ui';
    const workflow_id = 'ondemand-main.yaml';

    const context = github.context;
    const actor = context.actor;

    // console.log('The branch name is', context.ref);
    // console.log('The run number is', context.runNumber);
    // console.log('The run id is', context.runId);
    // console.log(context);

    // const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    //   owner,
    //   repo,
    //   workflow_id,
    //   actor,
    // });
    // console.log(actor);

    // core.startGroup('Listing workflow runs');
    // // console.log(runs.workflow_runs);
    // console.log(runs);
    // core.endGroup();

    core.startGroup('Trigger the workflow using the dispatch event');
    const result = await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      // ref: 'maintenance-3.0.x',
      ref: 'test-reusable-wf',
      inputs: {
        branch_name: branch_name,
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
    // console.log(result);
    core.endGroup();

    core.startGroup('Get workflow run details');
    await sleep(10000);
    let runs = await getWorkflowRuns(owner, repo, workflow_id, octokit);
    let i = 0;
    let run; // = runs[i]; // get the last run

    let step;
    do {
      await sleep(5000);
      run = runs[i++]; // get the last run
      let { data: wfJobs } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: run.id,
      });
      // console.log(wfJobs);

      const job = wfJobs.jobs[0];
      // console.log(job);
      if (job.status !== 'completed') {
        step = {
          name: 'continue',
        };
        continue;
      }
      step = job.steps[1];
      // run = runs[++i];
      // console.log(job);
      // console.log(step);
    } while (step.name !== `${context.runId}`);

    console.log(run);

    // console.log(run);
    let conclusion = run.conclusion;
    let status = run.status;
    let runId = run.id;
    let runNumber = run.run_number;
    // console.log('Run id', runId);
    // console.log('Run number', runNumber);

    core.info(`\u001b[1mRun URL ${run.html_url}`);
    do {
      await sleep(60000);
      // runs = await getWorkflowRuns(owner, repo, workflow_id, octokit);
      // run = runs.find((r) => r.id === runId);
      // conclusion = run.conclusion;
      // status = run.status;

      const runReq = await octokit.rest.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });
      run = runReq.data;
      // console.log(run);
      conclusion = run.conclusion;
      status = run.status;
      core.info(`Workflow status: ${status}`);
    } while (conclusion === null && status !== 'completed');

    if (conclusion === 'success' && status === 'completed') {
      core.info(`Workflow ${status} with ${conclusion}`);
    } else {
      core.setFailed(`Workflow ${status} with ${conclusion}.`);
    }
    core.endGroup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
