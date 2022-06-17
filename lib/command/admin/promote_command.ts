import {
    isJidUser,
    proto,
    WASocket,
} from "@adiwajshing/baileys";
import { messagingService, userRepository } from "../../constants/services";
import MessageModel from "../../database/models/message_model";
import { PrivilegeLevel } from "../../database/models/user/privilege_level";
import { ICommand } from "../../core/command/command";
import { fullEnumSearch } from "../../utils/enum_utils";


export default class PromoteCommand extends ICommand {
    command: string = "promote";
    help: string = 'Give a user a certain privilege level';

    privilegeLevel = PrivilegeLevel.Operator;

    async execute(client: WASocket, message: MessageModel, body?: string) {
        const splitBody = body?.split(' ');
        const level = fullEnumSearch(PrivilegeLevel, splitBody?.shift() ?? '');

        if (!level) {
            let enumKeys = Object.keys(PrivilegeLevel);
            enumKeys = enumKeys.slice(enumKeys.length / 2)

            const privilegesText = Array.from(Array(enumKeys.length).keys())
                .map((key) => `*${key}*. ${enumKeys[key]}`).join('\n');
            return messagingService.reply(message, `Please provide the privilege level the users should be promoted to.\n\n${privilegesText}`, true)
        }

        const mentionedSet = new Set<string>();
        (message.raw?.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? []).forEach((mention: string) => mentionedSet.add(mention))
        if (mentionedSet.size === 0) {
            return messagingService.reply(message, "Please tag those you want to promote.");
        }

        for (const mention of mentionedSet) {
            if (!isJidUser(mention)) continue;

            await userRepository.updateUserDB(mention, { privilegeLevel: level });
        }

        await messagingService.reply(message, `Updated the privilege level of all users tagged to ${PrivilegeLevel[level]} (${level})`)
    }
}
