import nock from 'nock';
import { matches } from 'lodash';

describe('main', () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    nock.cleanAll();
    process.env = OLD_ENV;
  });

  test('should report junit results when test failed', async () => {
    process.env['INPUT_TOKEN'] = 't0k3n';
    process.env['INPUT_PATH'] = '**/samples/TEST-*.xml';

    process.env['GITHUB_REPOSITORY'] = 'bar/let';

    const scope = nock('https://api.github.com')
      .persist()
      .post(
        '/repos/bar/let/check-runs',
        matches({ 'status': 'completed', 'conclusion': 'failure' })
      )
      .reply(200);

    const main = await import('../src/main');

    await main.run();

    scope.done();
  });

  test('should report junit results when test skipped (issue #41)', async () => {
    process.env['INPUT_TOKEN'] = 't0k3n';
    process.env['INPUT_PATH'] = '**/samples/ISSUE-41.xml';

    process.env['GITHUB_REPOSITORY'] = 'bar/foo';

    const scope = nock('https://api.github.com')
      .persist()
      .post(
        '/repos/bar/foo/check-runs',
        matches({ 'status': 'completed', 'conclusion': 'success' })
      )
      .reply(200);

    const main = await import('../src/main');

    await main.run();

    scope.done();
  });
});
