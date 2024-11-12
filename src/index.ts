import { Options, Packet, PacketType } from "./types";
import { Socket } from "net";

export class Rcon {
    private socket: Socket;
    private connected: boolean;
    private authed: boolean;
    private options: Options;
    private requestId: number = 0;

    constructor(Options: Options){
        this.options = Options;
        this.connected = false;
        this.authed = false;
        this.socket = new Socket();
        this.socket.on('close', () => {
            this.connected = false;
            this.authed = false;
            this.socket.destroy();
        })
    }
    public isConnected(): boolean {
        return this.connected && this.authed;
    }

    public disconnect(): void {
        this.connected = false;
        this.authed = false;
        this.socket.end();
    }
    public async query(cmd: string): Promise<string> {
        const response = await this.sendPacket({
            type: PacketType.REQUEST,
            body: cmd
        });
        return response.body;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.connect(this.options.port, this.options.host, async () => {
                try {
                    await this.authenticate();
                    this.connected = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
                
            });
            this.socket.on('error', reject);
        });
    }

    private async authenticate() {
        const response = await this.sendPacket({
            type: PacketType.LOGIN,
            body: this.options.password
        });
        if (response.body !== '') {
            throw new Error('Authentication error');
        }
        this.authed = true;
    }

    private async sendPacket(packet: Packet): Promise<Packet> {
        return new Promise(async (resolve, reject) => {
            try {
                this.socket.write(await this.serializePacket(packet));
                this.socket.once('data', (data) => {
                    try {
                        resolve(this.parsePacket(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    

    private async parsePacket(data: Buffer): Promise<Packet> {
        return new Promise((resolve, reject) => {
            const size = data.readInt32LE(0);
            const id = data.readInt32LE(4);
            if (id === this.requestId) {
                const type = data.readInt32LE(8);
                const body = data.toString('utf-8', 12, 12 + size - 10);
                resolve({ size, type, body, id});
            } else {
                reject(new Error('Invalid response id'));
            }
        });
    }
    private async serializePacket(packet: Packet): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            if (packet.size === undefined) {
                packet.size = Buffer.byteLength(packet.body);
            }
            if (packet.id === undefined) {
                packet.id = ++this.requestId;
            }
            const length = 4 + 4 + packet.size + 2;
            const buffer = Buffer.alloc(4 + length)

            buffer.writeInt32LE(length, 0);
            buffer.writeInt32LE(packet.id, 4);
            buffer.writeInt32LE(packet.type, 8);
            buffer.write(packet.body, 12, 'utf-8');
            buffer.writeInt16LE(0, 12 + packet.size);

            resolve(buffer);
        });
    }
}