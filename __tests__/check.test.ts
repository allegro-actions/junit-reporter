import nock from 'nock';
import Report from '../src/Report';
import { TestCase, TestSuite } from 'junit2json';
import { matches } from 'lodash';

describe('check', () => {
  const OLD_ENV = process.env;

  const report = new Report('**/TEST-*.xml');

  afterEach(() => {
    nock.cleanAll();
    process.env = OLD_ENV;
  });

  test('should send check for given report', async () => {
    process.env['GITHUB_REPOSITORY'] = 'foo/bar';
    process.env['GITHUB_JOB'] = 'build';

    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        skipped: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName'
          } as TestCase,
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{ message: 'Skipped' }]
          } as TestCase
        ]
      } as TestSuite
    ]);

    report.hasTests = jest.fn(() => true);
    report.isSuccesfull = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const scope = nock('https://api.github.com')
      .persist()
      .post(
        '/repos/foo/bar/check-runs',
        matches(
          {
            'name': 'JUnit Report: build',
            'status': 'completed',
            'conclusion': 'success',
            'output': {
              'title': 'JUnit Report: build',
              'summary': '# Results (2 tests) ✗\n\n## TestSuite\n\n| Test case           | Result | Duration |\n| :------------------ | :----: | :------: |\n| Successful TestCase |    ✓   |   0 ms   |\n| Skipped TestCase    |   💔   |   0 ms   |\n\n- **1** test was successful\n- **1** test is skipped\n\n## Skipped tests\n\n<details>\n<summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>\n\n> Skipped\n\n</details>\n'
            }
          }
        )
      )
      .reply(200);

    const check = await import('../src/check');

    await check.create('t0k3n', report);

    scope.done();
  });
});
