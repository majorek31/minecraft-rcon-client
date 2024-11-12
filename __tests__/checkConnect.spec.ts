import { Rcon } from "../src/index";
test("checkConnect", async () => {
    const client = new Rcon({
        host: '127.0.0.1',
        port: 25575,
        password: 'test'
    });
    await client.connect();
    expect(client.isConnected()).toBe(true);
    await client.disconnect();
});

test("queryServer", async () => {
    const client = new Rcon({
        host: '127.0.0.1',
        port: 25575,
        password: 'test'
    });
    await client.connect();
    const response = await client.query('list');
    expect(response).toContain('players online');
    await client.disconnect();
});