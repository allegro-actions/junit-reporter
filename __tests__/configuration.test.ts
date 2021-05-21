import nock from 'nock';
import configuration from '../src/configuration';

describe('configuration', () => {

    const host = 'http://dummy.page';
    const path = '/path';

    const INIT_ENV = Object.assign({}, process.env);

    afterEach(() => {
        nock.cleanAll();
        process.env = Object.assign({}, INIT_ENV);
    });

    test('should fetch remote config', async () => {
        process.env['INPUT_CONFIGURATION-URL'] = host + path;

        const scope = nock(host)
            .get(path)
            .reply(200, {
                webhookUrl: 'http://some.endpoint'
            });

        const result = await configuration.get();

        scope.done();
        expect(result?.webhookUrl).toEqual('http://some.endpoint');
    });
});
