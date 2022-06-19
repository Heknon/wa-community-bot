import { WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../../constants/services";
import { ICommand } from "../../../core/command/command";
import MessageModel from "../../../database/models/message_model";
import { getMessageBody } from "../../../utils/message_utils";

export default class JoinCommand extends ICommand {
    command: string = "join";
    help: string = "Want me in another group? Use this command! (You can send me DMs too)"
    help_category: string = 'Groups';

    private groupInviteRegex: RegExp = RegExp(/(https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]{22})/g)

    async execute(client: WASocket, message: MessageModel, body: string) {
        let matches = this.groupInviteRegex.exec(body ?? "");
        if ((!matches || (matches && matches.length == 0)) && message.quote) matches = this.groupInviteRegex.exec(getMessageBody(message.quote) ?? "");

        if (!matches || (matches && matches.length == 0)) {
            return await messagingService.reply(message, "You must quote or send along with the command a invite link", true);
        }

        const code = matches[2];
        try {
            client.groupAcceptInvite(code).then(async res => {
                const meta = await client.groupMetadata(res);
                await messagingService.reply(message, `Joined ${meta.subject}!`, true)
            });
            await messagingService.reply(message, "Joining the group...", true);
        } catch (e) {
            await messagingService.reply(message, "Failed to join group.\nI might've been kicked from it.", true);
        }
    }
}