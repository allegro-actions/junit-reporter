import {TestCase, TestSuite} from 'junit2json';
import * as core from '@actions/core';

export type NestableTestSuite = TestSuite & {
    testsuite?: NestableTestSuite[]
};

export function forEachTestCase(suites: NestableTestSuite[], func: (testCase: TestCase) => void): void {
    for (const suite of (suites || [])) {
        forEachTestCaseInSuite(suite, func);
    }
}

function forEachTestCaseInSuite(suite: NestableTestSuite, func: (testCase: TestCase) => void): void {
    if (!Array.isArray(suite.testcase) && !Array.isArray(suite.testsuite)) {
        core.warning(`Found empty testcase: ${JSON.stringify(suite)}`);
        return;
    }
    for (const testCase of (suite.testcase || [])) {
        func(testCase);
    }
    forEachTestCase((suite.testsuite || []), func);
}
