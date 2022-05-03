const rcon = require('../src/index')
rcon.rcon({
    port: 25575,
    host: 'localhost', 
    password: 'test'
})
rcon.connect().then(() =>{
    console.log('Connected to server')
    rcon.send("time query day").then((response) => {
        console.log(response)
    })
}).catch((err) => {
    if (err) throw err;
})
