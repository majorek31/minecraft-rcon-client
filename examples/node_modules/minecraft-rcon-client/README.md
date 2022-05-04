# minecraft-rcon-client

## Promise based rcon client that i made for communication with my server

## Installation
```
npm i minecraft-rcon-client
```
## Usage
```
const Rcon = require('minecraft-rcon-protocol')
const client = new Rcon({ // all of those are required!
    port: 25575,
    host: 'localhost',
    password: 'test'
})
client.connect().then(() => {
    client.send("time query day").then((response) => {
        console.log(response)
        client.disconnect()
    }).catch(err => {
        console.log("An error occurred while sending the query!")
    })
}).catch(err => {
    console.log("Connection to server cannot be established!")
})
```