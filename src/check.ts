import * as github from '@actions/github';
import * as core from '@actions/core';
import * as formatter from './formatter';
import * as matrix from './matrix';
import Report from './Report';

export async function create(token: string, report: Report): Promise<void> {
  const message = formatter.toMarkdown(report);

  const name = matrix.getName('JUnit Report');
  const status = 'completed' as const;
  const conclusion =
    report.hasTests() && report.isSuccesfull()
      ? ('success' as const)
      : ('failure' as const);
  const pullRequest = github.context.payload.pull_request;
  const head_sha = (pullRequest && pullRequest.head.sha) || github.context.sha;

  const createCheckRequest = {
    ...github.context.repo,
    name,
    head_sha,
    status,
    conclusion,
    output: {
      title: name,
      summary: message,
    },
  };

  core.debug(JSON.stringify(createCheckRequest, null, 2));

  const octokit = github.getOctokit(token);
  await octokit.checks.create(createCheckRequest);
}
