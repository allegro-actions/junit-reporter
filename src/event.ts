import Report from './Report';
import * as github from '@actions/github';
import * as core from '@actions/core';
import axios from 'axios';
import {TestCase} from 'junit2json';
import {CheckRun} from './check';

export async function send(report: Report, checkRun: CheckRun): Promise<void> {
    const url = core.getInput('webhook-url') || process.env.JUNIT_REPORTER_TEST_RESULTS_URL;
    const maxMessageSize = parseInt(core.getInput('webhook-message-size'));

    if (url && maxMessageSize) {
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

        const base = {
            ...github.context.repo,
            sha: github.context.sha,
            checkRun: checkRun,
            ref: github.context.ref,
            action: github.context.action,
            runNumber: github.context.runNumber,
            runId: github.context.runId,
            part: 0,
            last: false,
            testResults: [],
        };

        const baseSize = Buffer.byteLength(JSON.stringify(base));
        let testResultsChunk = [];
        let chunkSize = baseSize;
        let part = 0;

        for (const testResult of testResults) {
            const size = Buffer.byteLength(JSON.stringify(testResult)) + 1;

            if (chunkSize + size > maxMessageSize) {
                if (testResultsChunk.length == 0) {
                    throw new Error('Test result size is exceeding webhook-message-size param. ' +
                        `Test result size [${size}] + meta data [${chunkSize}] > [${maxMessageSize}]. ` +
                        `Test name [${testResult.name}]`);
                }

                core.info(`Sending test results to webhook endpoint - part [${part}].`);
                await axios.post(url, {
                    ...base,
                    part,
                    testResults: testResultsChunk
                });

                testResultsChunk = [];
                chunkSize = baseSize;
                part += 1;
            }

            testResultsChunk.push(testResult);
            chunkSize += size;
        }

        if (testResultsChunk.length > 0) {
            core.info('Sending test results to webhook endpoint.');
            await axios.post(url, {
                ...base,
                part,
                last: true,
                testResults: testResultsChunk
            });
        }
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
