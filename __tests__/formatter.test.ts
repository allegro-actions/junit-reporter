import Report from '../src/Report';
import { TestCase, TestSuite } from 'junit2json';
import { toMarkdown } from '../src/formatter';

const counter = jest.fn();
jest.mock('../src/Report', () => {
  return jest.fn().mockImplementation(() => {
    return { counter };
  });
});

describe('formatter', () => {
  const report = new Report('**/*.xml');

  test('should handle empty tests results', async () => {
    report.hasTests = jest.fn(() => false);

    expect(toMarkdown(report)).toEqual('### Test results not found\n');
  });

  test('should handle successful test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        testcase: [
          { name: 'TestCase', classname: 'TestCaseClassName' } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 1 test\n\n- **All** tests were successful'
    );
  });

  test('should handle empty testcase', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        testcase: undefined as unknown,
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 1 test\n\n- **All** tests were successful'
    );
  });

  test('should handle null values in data', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        tests: 1,
        testcase: undefined as unknown,
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;

    const result = toMarkdown(report);

    expect(result).toEqual(
        '### Found 1 test\n\n- **All** tests were successful'
    );
  });

  test('should handle failed test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        failures: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'Failed TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: 'Failed message' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.failures = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 2 tests\n\n' +
        '- **1** test was successful\n' +
        '- **1** test failed\n' +
        '### Failed tests\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: Failed TestCase</summary>\n\n' +
        '> Failed message\n\n' +
        '</details>\n'
    );
  });

  test('should handle skipped test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        skipped: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{ message: 'Skipped' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 2 tests\n\n' +
        '- **1** test was successful\n' +
        '- **1** test is skipped\n' +
        '### Skipped tests\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>\n\n' +
        '> Skipped\n\n' +
        '</details>\n'
    );
  });

  test('should handle test without message', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        skipped: 1,
        testcase: [
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{}],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 1;
    report.counter.succesfull = 0;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 1 test\n\n' +
        '- **None** test were successful\n' +
        '- **1** test is skipped\n' +
        '### Skipped tests\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>\n\n' +
        '> No message provided\n\n' +
        '</details>\n'
    );
  });

  test('should handle test with error', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        errors: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'TestCase with Error',
            classname: 'TestCaseClassName',
            error: [{ message: 'Something\nfailed' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => true);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.errors = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 2 tests\n\n' +
        '- **1** test was successful\n' +
        '- **1** test ended with error\n' +
        '### Errors\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: TestCase with Error</summary>\n\n' +
        '> Something\n> failed\n\n' +
        '</details>\n'
    );
  });

  test('should handle multiple results', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'First TestSuite',
        classname: 'FirstTestSuiteClassName',
        tests: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'SuccessfulTestCaseClassName',
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'SecondTestSuite',
        classname: 'SecondTestSuiteClassName',
        tests: 2,
        failures: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'SuccessfulTestCaseClassName',
          } as TestCase,
          {
            name: 'Failed TestCase',
            classname: 'FailedCaseClassName',
            failure: [{ message: 'Failed' }],
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'Third TestSuite',
        classname: 'ThirdTestSuiteClassName',
        tests: 1,
        skipped: 1,
        testcase: [
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{ message: 'Skipped' }],
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'SeparateTestSuite',
        classname: 'SeparateTestSuiteClassName',
        tests: 1,
        errors: 1,
        testcase: [
          {
            name: 'TestCase with Error',
            classname: 'TestCaseClassName',
            error: [{ message: 'Something\nfailed' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => true);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 5;
    report.counter.succesfull = 2;
    report.counter.failures = 1;
    report.counter.errors = 1;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report);

    expect(result).toEqual(
      '### Found 5 tests\n\n' +
        '- **2** tests were successful\n' +
        '- **1** test failed\n' +
        '- **1** test ended with error\n' +
        '- **1** test is skipped\n' +
        '### Errors\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: TestCase with Error</summary>\n\n' +
        '> Something\n> failed\n\n' +
        '</details>\n\n' +
        '### Failed tests\n\n' +
        '<details>\n ' +
        '<summary><strong>FailedCaseClassName</strong>: Failed TestCase</summary>\n\n' +
        '> Failed\n\n' +
        '</details>\n\n' +
        '### Skipped tests\n\n' +
        '<details>\n ' +
        '<summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>' +
        '\n\n> Skipped\n\n' +
        '</details>\n'
    );
  });

  test('should only display first 10 failed tests', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 12,
        failures: 12,
        testcase: [
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '1' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '2' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '3' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '4' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '5' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '5' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '7' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '8' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '9' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '10' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '11' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '12' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 12;
    report.counter.succesfull = 0;
    report.counter.failures = 12;
    report.counter.get = jest.fn(() => 12);

    const result = toMarkdown(report);

    expect(result).toContain(
      '_Only the first ten tests has been listed below!_'
    );
  });
});
