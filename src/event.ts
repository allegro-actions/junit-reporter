import Report from './Report';
import * as github from '@actions/github';
import * as core from '@actions/core';
import axios from 'axios';
import {TestCase} from 'junit2json';
import {CheckRun} from './check';

export async function send(report: Report, checkRun: CheckRun): Promise<void> {
    const url = core.getInput('webhook-url');
    core.info(JSON.stringify(process.env, null, 2));
    if (url) {
        const testResults = [];
        for (const testSuite of report.getTestSuites()) {
            if (!Array.isArray(testSuite.testcase)) {
                core.warning(`Found empty testcase: ${JSON.stringify(testSuite)}`);
                continue;
            }

            for (const testCase of testSuite.testcase) {
                const name = testCase.name.trim();
                const classname = testCase.classname.trim();
                const result = getResult(testCase);

                testResults.push({
                    name,
                    classname,
                    result
                });
            }
        }

        core.info(`Sending test results [${testResults.length}] to webhook endpoint.`);
        await axios.post(url, {
            ...github.context.repo,
            sha: github.context.sha,
            checkRun: checkRun,
            ref: github.context.ref,
            action: github.context.action,
            runNumber: github.context.runNumber,
            runId: github.context.runId,
            testResults: testResults,
        });
    } else {
        core.info('Skipping sending test results to webhook endpoint.');
    }
    return Promise.resolve();
}

function getResult(testCase: TestCase): string {
    if ((testCase.skipped?.length || 0) > 0) {
        return 'skipped';
    } else if ((testCase.failure?.length || 0) > 0 || (testCase.error?.length || 0) > 0) {
        return 'failed';
    } else {
        return 'successful';
    }
}
