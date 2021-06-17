import Report from '../src/Report';
import {forEachTestCase} from '../src/suites';

describe('nested suites', () => {
  test('find all test cases in nested test suites', async () => {
    const report = new Report('**/TEST-nested.xml');
    await report.build();

    const foundCases = [];
    forEachTestCase(report.getTestSuites(), testCase => {
      foundCases.push(testCase);
    });
    expect(foundCases.length).toEqual(9);
  });
});
