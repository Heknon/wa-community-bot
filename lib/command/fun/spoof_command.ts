import { WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import MessageModel from "../../database/models/message_model";

export default class SpoofCommand extends ICommand {
    command: string = "spoof";
    help: string = 'An exploit to spoof a friend\'s message. >>spoof @mention "spoofed message" "bot message"'
    help_category: string = 'Fun';

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!body) {
            return await this.error(message);
        }

        body = body.replace(/״/gmi, '"')
        const splitBody = body?.split(' ');
        const mentioned = splitBody?.shift()?.slice(1);
        const quotedPart = splitBody?.join(' ');
        if (!mentioned || !quotedPart) {
            return this.error(message);
        }

        const quotes = [...(quotedPart.matchAll(RegExp(/"(.*?)"/, "g")))];
        if (!body || quotes?.length != 2) {
            return await this.error(message);
        }

        const rawMessage = message.raw;
        if (!rawMessage) {
            return messagingService.reply(message, 'There seems to have been an error. Please try again.', true);
        }

        rawMessage.key.participant = mentioned + '@s.whatsapp.net'
        if (rawMessage.message!.extendedTextMessage) rawMessage.message!.extendedTextMessage!.text = quotes[0][1];
        rawMessage.message!.conversation = quotes[0][1];

        await messagingService.sendMessage(rawMessage.key.remoteJid!, {text: quotes[1][1]}, {quoted: rawMessage})
    }

    private async error(message: MessageModel) {
        return await messagingService.reply(message, 'Must follow >>spoof @mention "spoofed message" "bot message"', true);
    }
}