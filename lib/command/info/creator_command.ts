import {
    generateWAMessageFromContent,
    jidDecode,
    WASocket,
} from "@adiwajshing/baileys";
import VCard from "vcard-creator";
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import MessageModel from "../../database/models/message_model";

export default class CreatorCommand extends ICommand {
    command: string = "creator";
    help: string = 'Contact the creator of the bot (Reporting bugs)';

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!message.media && !body) {
            return await messagingService.reply(message, "You must have some content you want to send in the message.", true)
        }

        await messagingService.sendMessage(process.env.CREATOR_PHONE!, {text: `You received a message from:`})
        const vcard = new VCard()
        vcard.addName(undefined, message.raw?.pushName ?? 'Bot User');
        vcard.setProperty('TEL', `TEL;type=CELL;waid=${jidDecode(message.from).user}`, `+${jidDecode(message.from).user}`)
        await messagingService.sendMessage(process.env.CREATOR_PHONE!, {
            contacts: {
                contacts: [
                    { vcard: vcard.toString(), displayName: message.raw?.pushName ?? 'Bot User' }
                ]
            }
        });
        await client.relayMessage(process.env.CREATOR_PHONE!, message.raw?.message!, { messageId: message.id, participant: message.from });
    }
}
