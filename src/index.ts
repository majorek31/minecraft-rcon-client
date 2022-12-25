/*
author: majorek31
credits: https://wiki.vg/RCON
*/
import * as net from 'net';
import { Buffer } from 'buffer';
import * as crypto from 'crypto';
type Options = {
    host: string,
    port: number,
    password: string
};
enum RequestId {
    CMD_RESPONSE = 0,
    CMD_REQUEST = 2,
    LOGIN = 3,
}
export class Rcon {
    options: Options;
    socket: net.Socket | undefined;
    connected: boolean;
    authed: boolean;
    id: number;
    constructor(options: Options){
        this.options = options;
        this.connected = false;
        this.authed = false;
        this.id = 0;
    }
    connect(){
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection(this.options.port, this.options.host);
            this.socket.once('error', () => reject(new Error('Connection error')));
            this.socket.once('connect', () => {
                this.connected = true;
                this.id = crypto.randomInt(2147483647);
                this.sendRaw(this.options.password, RequestId.LOGIN);
                this.socket.once('data', (data) =>{
                    let response: number = data.readInt32LE(4);
                    if (response == this.id){
                        this.authed = true;
                        resolve(null);
                    }
                    else{
                        this.disconnect();
                        reject(new Error('Authentication error'));
                    }
                });
            });
        });
    }
    sendRaw(data: string, requestId: RequestId) {
        return new Promise((resolve, reject) => {
            if (!this.connected)
                reject(new Error('Authentication error'));
            let len = Buffer.byteLength(data);
            let buffer = Buffer.alloc(len + 14);
            buffer.writeInt32LE(len + 10, 0);
            buffer.writeInt32LE(this.id, 4);
            buffer.writeInt32LE(requestId, 8);
            buffer.write(data, 12, 'ascii');
            buffer.writeInt16LE(0, 12 + len);
            this.socket.write(buffer);
            this.socket.once('data', (data: Buffer) => {
                resolve(data.toString('ascii', 12));
            });
        });
    }
    send(cmd: string) {
        return new Promise((resolve, reject) => {
            if (!this.authed || !this.connected)
                reject(new Error('Authentication error'));
            this.sendRaw(cmd, 2).then(p => resolve(p));
        });
    }
    disconnect() {
        this.connected = false;
        this.authed = false;
        this.socket.end();
    }
}