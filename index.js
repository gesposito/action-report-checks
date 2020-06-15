const fs = require("fs");
const util = require("util");

const rename = util.promisify(fs.rename);

const core = require("@actions/core");
const github = require("@actions/github");

const NetlifyAPI = require("netlify");

const { read, title, summary } = require("./lib/report");

async function run() {
  try {
    const githubToken = core.getInput("github_token");
    const netlifyToken = core.getInput("netlify_token");
    const netlifySiteId = core.getInput("netlify_site_id");
    const reportPath = core.getInput("report_path");
    const reportFilename = core.getInput("report_filename");
    const selector = core.getInput("summary_selector");

    const fullPath = `${reportPath}${reportFilename}`;
    const HTML = await read(fullPath);
    const checkName = await title(HTML, selector);
    const outputSummary = await summary(HTML, selector);

    const pullRequest = github.context.payload.pull_request;
    const conclusion = "success";
    const status = "completed";
    const head_sha =
      (pullRequest && pullRequest.head.sha) || github.context.sha;

    // Only 65535 characters are allowed in checks.output.text
    const netlify = new NetlifyAPI(netlifyToken);

    // Move the file to a unique location
    const newFilename = `${head_sha}.html`;
    const newFullPath = `${reportPath}${newFilename}`;
    await rename(fullPath, newFullPath);
    const { deploy } = await netlify.deploy(netlifySiteId, reportPath);

    const detailsUrl = `${deploy.deploy_ssl_url}/${newFilename}`;
    console.log(detailsUrl);
    core.debug(detailsUrl);

    // https://developer.github.com/v3/checks/runs/
    const createCheckRequest = {
      ...github.context.repo,
      name: checkName,
      head_sha,
      status,
      conclusion,
      details_url: detailsUrl,
      output: {
        title: outputSummary.trim(),
        summary: `
${outputSummary}
Full report [available here](${detailsUrl})
`,
      },
    };

    const octokit = github.getOctokit(githubToken);
    await octokit.checks.create(createCheckRequest);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
