# minecraft-rcon-client

## Promise based minecraft rcon client, with support of types

## Installation
```
npm i minecraft-rcon-client
```
## Usage
```ts
import { Rcon } from "minecraft-rcon-client";
const client = new Rcon({
    host: '127.0.0.1',
    port: 25575,
    password: 'test'
});
await client.connect();
const response = await client.query('list');
console.log(response);
await client.disconnect();
```