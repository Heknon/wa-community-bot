import { extractMessageContent, generateMessageID, generateWAMessageFromContent, isJidGroup, jidDecode, MediaType, WAMessage, WASocket } from "@adiwajshing/baileys";
import { getClientID } from "../../utils/client_utils";
import { getMessageMediaBuffer, getMessageMediaType } from "../../utils/media_utils";
import { getMessageBody, getMessageBodyRaw, getQuotedMessage, getQuotedMessageRaw } from "../../utils/message_utils";
import { WhatsAppBot } from "../../whatsapp_bot";
import MessageMetadata from "./message_metadata";

export default class MessageModel {
    public id: string;
    public timestamp: number;
    public content: string | undefined | null;
    public media: Buffer | undefined;
    public mediaType: MediaType | undefined; 
    public reply: MessageModel | undefined | null;
    public from: string;
    public to: string;
    public metadata: MessageMetadata | undefined | null;

    public raw: WAMessage | undefined | null;

    constructor(
        id: string,
        timestamp: number,
        content: string | undefined | null,
        media: Buffer | undefined,
        mediaType: MediaType | undefined,
        reply: MessageModel | undefined | null,
        from: string,
        to: string,
        metadata: MessageMetadata | undefined | null = undefined,
        raw: WAMessage | undefined | null = undefined,
    ) {
        this.id = id;
        this.timestamp = timestamp;
        this.content = content;
        this.media = media;
        this.mediaType = mediaType;
        this.reply = reply;
        this.from = from;
        this.to = to;
        this.metadata = metadata;
        this.raw = raw;
    }

    public inGroup() {
        return isJidGroup(this.to);
    }

    /**
     * Will be true if the message is from the bot
     */
    public get fromMe() {
        return this.from == WhatsAppBot.currentClientId;
    }

    public get sender() {
        if (isJidGroup(this.to)) return this.from;

        return this.fromMe ? this.to : this.from;
    }

    public static async fromWAMessage(message: WAMessage, metadata: MessageMetadata | undefined = undefined): Promise<MessageModel> {
        const fromGroup = isJidGroup(message.key.remoteJid!);
        const fromMe = fromGroup ? message.key.participant! == WhatsAppBot.currentClientId : message.key.fromMe;
        const from = fromMe ? WhatsAppBot.currentClientId : fromGroup ? message.key.participant! : message.key.remoteJid!;
        const to = fromGroup ? message.key.remoteJid! : fromMe ? message.key.remoteJid! : WhatsAppBot.currentClientId;

        let quoted: WAMessage | undefined = getQuotedMessageRaw(message)

        return new MessageModel(
            message.key.id!,
            Number(message.messageTimestamp!),
            getMessageBodyRaw(message),
            await getMessageMediaBuffer(message),
            getMessageMediaType(message),
            quoted ? await MessageModel.fromWAMessage(quoted) : undefined,
            from!,
            to!,
            metadata,
            message,
        );
    }

    public toMap() {
        return {
            "_id": this.id,
            "timestamp": this.timestamp,
            "content": this.content,
            "media": this.media,
            'media_type': this.mediaType,
            "reply": this.reply?.toMap(),
            "from": this.from,
            "to": this.to,
            'metadata': this.metadata?.toMap()
        }
    }

    public static fromMap(map: Map<String, object>) {
        return new MessageModel(
            map['_id'],
            map['timestamp'],
            map['content'],
            map['media'],
            map['media_type'],
            map['reply'] ? MessageModel.fromMap(map['reply']) : undefined,
            map['from'],
            map['to'],
            map['metadata'] ? MessageMetadata.fromMap(map['metadata']) : undefined
        );
    }
}