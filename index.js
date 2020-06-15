const core = require("@actions/core");
const github = require("@actions/github");

const { read, summary } = require("./lib/report");

async function run() {
  try {
    const githubToken = core.getInput("github_token");
    const reportPath = core.getInput("report_path");
    const selector = core.getInput("summary_selector");

    const HTML = await read(reportPath);
    const summaryOutput = await summary(HTML, selector);

    const pullRequest = github.context.payload.pull_request;
    const conclusion = "success";
    const status = "completed";
    const head_sha =
      (pullRequest && pullRequest.head.sha) || github.context.sha;

    // https://developer.github.com/v3/checks/runs/
    const createCheckRequest = {
      ...github.context.repo,
      name: "Report Output",
      head_sha,
      status,
      conclusion,
      output: {
        title: "Contents",
        summary: summaryOutput,
        text: HTML,
      },
    };

    const octokit = github.getOctokit(githubToken);
    await octokit.checks.create(createCheckRequest);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
