import * as core from '@actions/core';
import * as check from './check';
import Report from './Report';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true});
    const reportsPath = core.getInput('path', {required: true});
    const matrix = core.getInput('matrix', {required: false});
    core.debug(JSON.stringify(matrix, null, 2));

    const report = new Report(reportsPath);
    await report.build();

    await check.create(token, report);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
