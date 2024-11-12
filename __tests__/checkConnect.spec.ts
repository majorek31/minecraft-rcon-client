import { Rcon } from "../src/index";
test("checkConnect", () => {
    const client = new Rcon({
        host: '127.0.0.1',
        port: 25575,
        password: 'password'
    });
    client.connect().then(() => {
        expect(client.isConnected()).toBe(true);
    }).finally(() => { 
        client.disconnect();
    });
});

test("queryServer", () => {
    const client = new Rcon({
        host: '127.0.0.1',
        port: 25575,
        password: 'password'
    });
    client.connect().then(() => {
        client.query('list').then((response) => {
            expect(response).toContain('players online');
        });     
    }).finally(() => { 
        client.disconnect();
    });
});