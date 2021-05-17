import nock from 'nock';
import Report from '../src/Report';
import * as event from '../src/event';
import {find} from 'lodash';

describe('event', () => {

    const host = 'http://dummy.page';
    const path = '/path';

    const INIT_ENV = Object.assign({}, process.env);

    afterEach(() => {
        nock.cleanAll();
        process.env = Object.assign({}, INIT_ENV);
    });

    test('should send http event with junit report', async () => {
        process.env['INPUT_WEBHOOK-URL'] = 'http://dummy.page/path';
        process.env['INPUT_WEBHOOK-MESSAGE-SIZE'] = '8096';
        process.env['GITHUB_REPOSITORY'] = 'foo/bar';
        process.env['GITHUB_SHA'] = 'fooSha';

        const report = new Report('**/samples/event-test.xml');
        await report.build();
        const checkRun = {
            id: 10,
            nodeId: 'checkRunNodeId',
            checkSuiteId: 12
        };

        const scope = nock(host)
            .post(path, body => {
                expect(body.part).toEqual(0);
                expect(body.owner).toEqual('foo');
                expect(body.repo).toEqual('bar');
                expect(body.checkRun).toEqual(checkRun);
                expect(body.testResults).toHaveLength(7);
                expect(find(body.testResults, test => test.name == 'successful')).toEqual({
                    result: 'successful',
                    classname: 'pl.success.github.GitHubSpec',
                    name: 'successful'
                });
                expect(find(body.testResults, test => test.name == 'error')).toEqual({
                    result: 'failed',
                    classname: 'pl.failure.github.GitHubSpec',
                    name: 'error'
                });
                expect(find(body.testResults, test => test.name == 'skipped')).toEqual({
                    result: 'skipped',
                    classname: 'pl.skipped.github.GitHubSpec',
                    name: 'skipped'
                });

                return true;
            })
            .reply(200);

        await event.send(report, checkRun);

        scope.done();
    });

    test('should send event in parts when event size is greater than webhook-message-size', async () => {
        const maxSize = 722;
        process.env['INPUT_WEBHOOK-URL'] = 'http://dummy.page/path';
        process.env['INPUT_WEBHOOK-MESSAGE-SIZE'] = `${maxSize}`;
        process.env['GITHUB_REPOSITORY'] = 'foo/bar';

        const report = new Report('**/samples/event-test.xml');
        await report.build();
        const checkRun = {
            id: 10,
            nodeId: 'checkRunNodeId',
            checkSuiteId: 12
        };

        const first = nock(host)
            .post(path, body => {
                expect(Buffer.byteLength(JSON.stringify(body))).toBeLessThan(maxSize);
                expect(body.part).toEqual(0);
                expect(body.last).toBeFalsy();
                return true;
            })
            .reply(200);

        const second = nock(host)
            .post(path, body => {
                 expect(Buffer.byteLength(JSON.stringify(body))).toBeLessThan(maxSize);
                 expect(body.part).toEqual(1);
                 expect(body.last).toBeTruthy();
                 return true;
            })
            .reply(200);

        await event.send(report, checkRun);

        first.done();
        second.done();
    });

    test('should do nothing if webhook-url is not defined', async () => {
        const report = new Report('**/samples/event-test.xml');
        await report.build();
        const checkRun = {
            id: 10,
            nodeId: 'checkRunNodeId',
            checkSuiteId: 12
        };

        await event.send(report, checkRun);
    });
});
