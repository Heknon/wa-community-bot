import {
    proto,
    WASocket,
} from "@adiwajshing/baileys";
import { messagingService } from "../../constants/services";
import MessageModel from "../../database/models/message_model";
import { PrivilegeLevel } from "../../database/models/user/privilege_level";
import { Permission } from "../../core/privileged";
import { ICommand } from "../../core/command/command";


export default class JIDCommand extends ICommand {
    command: string = "jid";
    help: string = 'Debugging tool for getting chat JID';

    privilegeLevel = PrivilegeLevel.Moderator;

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!message.raw?.key.remoteJid) return;

        await messagingService.reply(message, `JID: ${message.raw?.key.remoteJid ?? 'N/A'}`)
    }
}
