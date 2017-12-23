const frameworks = [
    'restify',
    'express',
    'koa',
    'connect',
];

describe('framework', () => {

    frameworks.forEach(framework => {
        describe(framework, () => {
            const got = require('got');
            const url = 'http://localhost:9001';
            let server;

            beforeAll(() => {
                return require(`../../examples/${framework}`).then((srv) => server = srv);
            });

            afterAll(() => {
                server.close();
            });

            it('should restrict /secret path', async () => {
                const secretPromise = got.get(url + '/secret');
                await expect(secretPromise).rejects.toHaveProperty('statusCode', 403);
            });

            it('should restrict /secret path with wrong token', async () => {
                const secretPromise = got.get(url + '/secret', {
                    headers: {'X-Session-Token': 'my-fake-token'},
                });
                await expect(secretPromise).rejects.toHaveProperty('statusCode', 403);
            });

            it('should login and show data from /secret path', async () => {
                // login
                const loginResponse = await got.post(url + '/login', {
                    body: {name: 'Bob'},
                    json: true,
                });
                const token = loginResponse.headers['x-session-token'];

                // secret
                const secretPromise = got.get(url + '/secret', {
                    headers: {'X-Session-Token': token},
                });
                await expect(secretPromise).resolves.toHaveProperty('statusCode', 200);
            });

            it('should login, logout and restrict /secret path', async () => {
                // login
                const loginResponse = await got.post(url + '/login', {
                    body: {name: 'Bob'},
                    json: true,
                });
                const token = loginResponse.headers['x-session-token'];

                // logout
                const logoutResponse = await got.post(url + '/logout', {
                    headers: {'X-Session-Token': token},
                    json: true,
                });
                expect(logoutResponse.body.user).toBeFalsy();

                // secret
                const secretPromise = got.get(url + '/secret', {
                    headers: {'X-Session-Token': token},
                });
                await expect(secretPromise).rejects.toHaveProperty('statusCode', 403);
            });
        });
    });

});
