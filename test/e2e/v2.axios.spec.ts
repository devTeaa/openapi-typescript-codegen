import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v2.node', () => {
    beforeAll(async () => {
        await generate('v2/axios', 'v2', 'axios');
        compileWithTypescript('v2/axios');
        await server.start('v2/axios');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v2/axios/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v2/axios/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            const { SimpleService } = require('./generated/v2/axios/index.js');
            const promise = SimpleService.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('The user aborted a request.');
    });
});
