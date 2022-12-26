import { Rcon } from '../lib';
test('Test connection', async () => {
   let client: Rcon = new Rcon({ host: 'localhost', port: 25575, password: 'testing' });
   try {
      let res = await client.connect();
      client.disconnect();
   } catch (err) {
      expect(err).toBe(null);
      console.error('In order to test this you have to run a Rcon server on your local machine on port 25575 with password "testing"!');
   }
   client.disconnect();
});

test('Test data fetching', async () => {
   let client: Rcon = new Rcon({ host: 'localhost', port: 25575, password: 'testing' });
   try {
      await client.connect();
      let res = await client.send('this command doesn t exist');
      expect(res).toBe('Unknown command. Type "/help" for help.');
      client.disconnect();
   } catch (err) {
      client.disconnect();
   }
   client.disconnect();
})