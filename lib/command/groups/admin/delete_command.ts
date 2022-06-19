import { isJidGroup, WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../../constants/services";
import { ICommand } from "../../../core/command/command";
import { Permission } from "../../../core/privileged";
import MessageModel from "../../../database/models/message_model";
import { GroupPrivilegeLevel } from "../../../database/models/whatsapp/group_privilege_level";
import { WhatsAppBot } from "../../../whatsapp_bot";

export default class DeleteCommand extends ICommand {
    command: string = "delete";
    help: string = "Delete a message by the bot.\nDon't abuse, have fun."
    help_category: string = 'Group Admin';

    async onFailedPermission(message: MessageModel | undefined, permission: Permission, processedData?: any) {
        if (permission == Permission.GroupPrivilegeLevel && message) {
            return messagingService.reply(message, 'You must be a group admin to use this command.', true)
        }
    }

    groupPrivilegeLevel: GroupPrivilegeLevel = GroupPrivilegeLevel.Admin;

    async execute(client: WASocket, message: MessageModel, body: string) {
        const raw = message.raw;
        if (!raw) {
            return messagingService.reply(message, 'An error occurred. Try again.', true);
        }

        if (!message.quote) {
            return messagingService.reply(message, 'Please quote the message you want to delete.', true);
        }

        if (message.quote?.from != WhatsAppBot.currentClientId) {
            return messagingService.reply(message, 'That message isn\'t from me 🧐🤦‍♂️', true);
        }

        try {
            await client.sendMessage(raw.key.remoteJid!, { delete: message.quote.raw?.key! })
        } catch (err) {
            return messagingService.reply(message, 'An error occurred. Try again.', true);
        }
    }
}