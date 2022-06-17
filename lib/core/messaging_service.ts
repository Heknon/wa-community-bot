import { AnyMessageContent, isJidGroup, MiscMessageGenerationOptions, WAMessage, WASocket } from "@adiwajshing/baileys";
import { assert } from "console";
import MessageMetadata from "../database/models/message_metadata";
import MessageModel from "../database/models/message_model";

export default class MessagingService {
    private client: WASocket | undefined;
    private metadataEnabled: boolean;
    private metadataAssignment: Map<string, MessageMetadata>;

    constructor(client?: WASocket, metadataEnabled: boolean = true) {
        this.client = client;
        this.metadataAssignment = new Map();
        this.metadataEnabled = metadataEnabled;
    }

    /**
     * must be ran in order to intercept message and inject metadata sent from the service
     * @param message raw message from socket
     * @returns message model with metadata
     */
    public async messageInterceptor(message: WAMessage): Promise<MessageModel> {
        assert(this.metadataEnabled, 'metadataEnabled must be set to true for interceptor to run');

        const metadata = this.metadataAssignment.get(message.key.id!);
        this.metadataAssignment.delete(message.key.id!);

        return await MessageModel.fromWAMessage(message, metadata);
    }

    public async reply(
        message: MessageModel,
        content: string,
        quote: boolean = false,
        privateReply: boolean = false,
        metadata?: MessageMetadata
    ) {
        await this.replyAdvanced(message, { text: content }, quote, privateReply, metadata);
    }

    public async replyAdvanced(
        message: MessageModel,
        content: AnyMessageContent,
        quote: boolean = false,
        privateReply: boolean = false,
        metadata?: MessageMetadata
    ) {
        if (quote) {
            message.raw!.key.fromMe = false;
        }

        let recipient: string;
        if (isJidGroup(message.to)) {
            recipient = privateReply ? message.from : message.to;
        } else {
            recipient = message.fromMe ? message.to : message.from
        }

        return this._internalSendMessage(recipient, content, { "quoted": quote ? message.raw ?? undefined : undefined }, metadata);
    }

    public async sendMessage(recipient: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions, metadata?: MessageMetadata) {
        return this._internalSendMessage(recipient, content, options, metadata);
    }

    private async _internalSendMessage(recipient: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions, metadata?: MessageMetadata): Promise<MessageModel> {
        assert(this.client, "Client must be set using setClient() method!");

        try {
            const response = await this.client!.sendMessage(recipient, content, options);

            if (this.metadataEnabled) this.metadataAssignment[response.key.id!] = metadata;
            return MessageModel.fromWAMessage(response, metadata);
        } catch (err) {
            console.error(err);
            const response = await this.client!.sendMessage(recipient, {'text': "An error occurred while sending the message."}, options);
            return MessageModel.fromWAMessage(response, metadata);
        }
    }


    public setClient(client: WASocket) {
        this.client = client;
    }
}