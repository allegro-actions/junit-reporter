import {TestSuite} from 'junit2json';

export default class Counter {
  tests = 0;
  skipped = 0;
  failures = 0;
  errors = 0;
  succesfull = 0;

  setup(testSuites: TestSuite[]): void {
    this.tests = 0;
    this.skipped = 0;
    this.failures = 0;
    this.errors = 0;

    for (const suite of testSuites) {
      this.update(suite);
    }

    this.succesfull = this.tests - this.failures - this.errors - this.skipped;
  }

  update(suite: TestSuite): void {
    this.tests = this.tests + (suite.tests || 0);
    this.skipped = this.skipped + (suite.skipped || 0);
    this.failures = this.failures + (suite.failures || 0);
    this.errors = this.errors + (suite.errors || 0);
  }

  get(key: string): number {
    switch (key) {
      case 'tests': {
        return this.tests;
      }
      case 'skipped': {
        return this.skipped;
      }
      case 'failures': {
        return this.failures;
      }
      case 'errors': {
        return this.errors;
      }
      default: {
        return 0;
      }
    }
  }
}
