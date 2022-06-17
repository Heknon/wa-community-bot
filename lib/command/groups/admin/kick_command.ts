import { WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../../constants/services";
import { ICommand } from "../../../core/command/command";
import MessageModel from "../../../database/models/message_model";
import { GroupPrivilegeLevel } from "../../../database/models/whatsapp/group_privilege_level";
import { getGroupPrivilegeMap } from "../../../utils/group_utils";
import { WhatsAppBot } from "../../../whatsapp_bot";

export default class KickCommand extends ICommand {
    command: string = "kick";
    help: string = "Kick someone from the group";
    allowPMs: boolean = false;
    groupPrivilegeLevel: GroupPrivilegeLevel = GroupPrivilegeLevel.Admin;

    async execute(client: WASocket, message: MessageModel, body?: string) {
        const adminMap = await getGroupPrivilegeMap(client, message.to);
        const senderPrivilegeLevel = adminMap[message.from];
        const iAmAdmin: boolean = adminMap[WhatsAppBot.currentClientId!] > 0;

        if (!iAmAdmin) {
            return await messagingService.reply(message, "Give the bot admin access in order to use this command.", true);
        } else if (!message.raw) {
            return await messagingService.reply(message, "There seems to have been an error. Please try again.", true);
        }

        const kickListSet = new Set<string>();
        const kickList: string[] = [];
        (message.raw.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? []).forEach((kick: string) => kickListSet.add(kick))
        if (!kickListSet) {
            return await messagingService.reply(message, "In order to kick someone you must tag them in this command.", true);
        }

        let attemptedSameLevelKick = false;
        const kickIncludesBot = kickList.includes(WhatsAppBot.currentClientId!);
        for (const kick of kickListSet) {
            if (adminMap[kick] >= senderPrivilegeLevel) {
                attemptedSameLevelKick = true;
                continue;
            }

            kickList.push(kick)
        }

        let errorMessage = "";
        if (kickIncludesBot) errorMessage += "I can't kick myself 😕\nTry using >>gtfo";
        if (attemptedSameLevelKick) errorMessage += kickIncludesBot ? "\nIt also seems like you tried to kick an admin when you are an admin 🤦‍♂️" : "You cannot kick an admin if you are an admin";

        if (kickIncludesBot || attemptedSameLevelKick) {
            return await messagingService.reply(message, errorMessage, true);
        }

        client.groupParticipantsUpdate(message.to, kickList, 'remove').then(async res => {
            await messagingService.reply(message, "Success 🎉🥳🥳", true);
        }).catch(err => {
            console.error(err);
        });
    }
}