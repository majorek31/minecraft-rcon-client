const Rcon = require('minecraft-rcon-client')
const readline = require('readline')
const client = new Rcon({
    port: 25575,
    host: 'localhost',
    password: 'test'
})
const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})
reader.on('line', function (line) {
    client.send(line).then(response => {console.log(response)})
})
client.connect().catch(err => console.error(err))