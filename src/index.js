/*
author: majorek31
credits: https://wiki.vg/RCON
*/
const net = require('net')
const Buffer = require('buffer').Buffer
const crypto = require('crypto')

module.exports = class Rcon {
    constructor(options){
        this.options = options
    
        this.socket = null
        this.connected = false
        this.authed = false
        this.id
    }
    connect(){
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection({port: this.options.port})
            this.socket.on('error', () => reject(new Error('Connection error')))
            this.socket.on('connect', () => {
                this.connected = true
                this.id = crypto.randomInt(32752) // random number because why not?
                this.sendRaw(this.options.password, 3) // request id 3 stands for login request
                this.socket.once('data', (data) =>{
                    let response = data.readInt32LE(4)
                    if (response == this.id){
                        this.authed = true
                        resolve()
                    }
                    else{
                        this.disconnect()
                        reject(new Error('Authentication error'))
                    }
                })
            })
        })
    }
    sendRaw(data, requestId) {
        return new Promise((resolve, reject) => {
            if (!this.connected)
                reject(new Error('Authentication error'))
            let len = Buffer.byteLength(data)
            let buffer = Buffer.alloc(len + 14)
            buffer.writeInt32LE(len + 10, 0)
            buffer.writeInt32LE(this.id, 4)
            buffer.writeInt32LE(requestId, 8)
            buffer.write(data, 12, 'ascii')
            buffer.writeInt16LE(0, 12 + len)
            this.socket.write(buffer)
        })
    }
    send(cmd) {
        return new Promise((resolve, reject) => {
            if (!this.authed || !this.connected)
                reject(new Error('Authentication error'))
            this.sendRaw(cmd, 2) // request id 2 stands for command execute request
            this.socket.once('data', (data) => {
                resolve(data.toString('ascii', 12))
            })
        })
    }
    disconnect() {
        this.connected = false
        this.authed = false
        this.socket.end()
    }
}