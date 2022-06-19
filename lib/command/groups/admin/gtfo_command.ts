import { isJidGroup, WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../../constants/services";
import { ICommand } from "../../../core/command/command";
import MessageModel from "../../../database/models/message_model";
import { GroupPrivilegeLevel } from "../../../database/models/whatsapp/group_privilege_level";

export default class GtfoCommand extends ICommand {
    command: string = "gtfo";
    help: string = "Kick me out using this command."
    help_category: string = 'Group Admin';

    allowPMs: boolean = false;
    groupPrivilegeLevel: GroupPrivilegeLevel = GroupPrivilegeLevel.Admin;

    async execute(client: WASocket, message: MessageModel, body: string) {
        if (!isJidGroup(message.to)) {
            return messagingService.reply(message, 'There seems to be an error.\nYou cannot use this command in a private chat.');
        }

        await messagingService.reply(message, "Leaving the group chat...\nPeace out ✌️");
        return await client.groupLeave(message.to);
    }
}