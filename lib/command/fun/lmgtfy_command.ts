import {
    proto,
    WASocket,
} from "@adiwajshing/baileys";
import url from 'node:url';
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import MessageModel from "../../database/models/message_model";

export default class LmgtfyCommand extends ICommand {
    command: string = "Lmgtfy";
    help: string = 'Help someone in the most condescending way possible';
    help_category: string = 'Fun';

    private readonly base_link = 'https://lmgtfy.app/?q='

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!body) {
            return await messagingService.reply(message, "You must provide some text to Google");
        }

        const link = url.format(this.base_link + body + '&iie=1')
        await messagingService.reply(message, "You couldn't Google that yourself huh?\n" + link, true)
    }
}
