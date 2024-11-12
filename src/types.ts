export type Options = {
    host: string,
    port: number,
    password: string
};

export type Packet = {
    size?: number,
    id?: number,
    type: PacketType,
    body: string
}

export enum PacketType {
    RESPONSE = 0,
    REQUEST = 2,
    LOGIN = 3,
}