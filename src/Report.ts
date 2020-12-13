import * as core from '@actions/core';
import * as fs from 'fs';
import * as glob from '@actions/glob';
import {parse, TestSuite, TestSuites} from 'junit2json';
import Counter from './Counter';

export const {readFile} = fs.promises;

export default class Report {
  readonly counter: Counter = new Counter();

  private readonly path: string;
  private testSuites: TestSuite[] = [];

  constructor(path: string) {
    this.path = path;
  }

  async build(): Promise<void> {
    core.debug(`Will search ${this.path} for test JUnit test reports`);

    const globber = await glob.create(this.path, {followSymbolicLinks: false});

    for await (const file of globber.globGenerator()) {
      const result = await parse(await readFile(file, 'utf-8'));

      if (Report.isTestSuites(result)) {
        for (const testsuite of result.testsuite) {
          if (testsuite.name === 'undefined') testsuite.name = result.name || testsuite.name;

          this.testSuites.push(testsuite);
        }
      } else {
        this.testSuites.push(result);
      }
    }

    this.counter.setup(this.testSuites);
  }

  getTestSuites(): TestSuite[] {
    return this.testSuites;
  }

  isSuccesfull(): boolean {
    return this.counter.tests === this.counter.succesfull;
  }

  hasTests(): boolean {
    return this.counter.tests > 0;
  }

  hasSkipped(): boolean {
    return this.counter.skipped > 0;
  }

  hasFailures(): boolean {
    return this.counter.failures > 0;
  }

  hasErrors(): boolean {
    return this.counter.errors > 0;
  }

  private static isTestSuites(report: TestSuites | TestSuite): report is TestSuites {
    return (report as TestSuites).testsuite !== undefined;
  }
}
