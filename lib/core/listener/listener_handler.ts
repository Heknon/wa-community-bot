import { WAMessage, WASocket } from "@adiwajshing/baileys";
import { assert } from "console";
import MessageModel from "../../database/models/message_model";
import { IListener } from "./listener";

export class ListenerHandler {
    private listeners: Array<IListener> = [];
    private client?: WASocket;

    constructor(client?: WASocket) {
        this.client = client;
    }

    public async findListeners(message: MessageModel) {
        const listeners: Array<IListener> = [];

        for (const listener of this.listeners) {
            if (await listener.filter(message)) listeners.push(listener);
        }

        return listeners;
    }

    public async executeListeners(message: MessageModel, ...listeners: Array<IListener>) {
        assert(this.client, "this.client must be set through setClient(client: WASocket)");

        for (const listener of listeners) {
            if (!(await listener.hasPermission(message))) continue;

            await listener.execute(this.client!, message);
        }
    }

    public registerListener(listener: IListener) {
        this.listeners.push(listener);
    }

    public setClient(client: WASocket) {
        this.client = client;
    }
}