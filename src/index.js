const net = require('net')
const Buffer = require('buffer').Buffer
const crypto = require('crypto')
function rcon(options) {
    this.options = options

    this.socket = null
    this.connected = false
    this.authed = false
    this.id
}
function connect(){
    return new Promise((resolve, reject) => {
        this.socket = net.createConnection({port: this.options.port})
        this.socket.on('error', () => reject(new Error('Connection error')))
        this.socket.on('connect', () => {
            this.connected = true
            len = Buffer.byteLength(this.options.password)
            id = crypto.randomInt(32752)
            buffer = Buffer.alloc(len + 14)
            buffer.writeInt32LE(len + 10, 0)
            buffer.writeInt32LE(id, 4)
            buffer.writeInt32LE(3, 8)
            buffer.write(this.options.password, 12, 'ascii')
            buffer.writeInt16LE(0, 12 + len)
            this.socket.write(buffer)
            this.socket.on('data', (data) =>{
                response = data.readInt32LE(4)
                if (response == id){
                    this.id = id;
                    this.authed = true
                    resolve()
                }
                else
                    reject(new Error('Authentication error'))
            })
        })
    })
}
function send(cmd) {
    return new Promise((resolve, reject) => {
        if (!this.authed || !this.connected)
            reject(new Error('Authentication error'))
        len = Buffer.byteLength(cmd)
        buffer = Buffer.alloc(len + 14)
        buffer.writeInt32LE(len + 10, 0)
        buffer.writeInt32LE(this.id, 4)
        buffer.writeInt32LE(2, 8)
        buffer.write(cmd, 12, 'ascii')
        buffer.writeInt16LE(0, 12 + len)
        this.socket.write(buffer)
        this.socket.on('data', (data) => {
            resolve(data.toString('ascii', 12))
        })
    })
}
module.exports = {
    rcon,
    connect,
    send
}