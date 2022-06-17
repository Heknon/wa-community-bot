import { isJidGroup, WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../../constants/services";
import { ICommand } from "../../../core/command/command";
import MessageModel from "../../../database/models/message_model";
import { GroupPrivilegeLevel } from "../../../database/models/whatsapp/group_privilege_level";
import { getGroupPrivilegeMap } from "../../../utils/group_utils";
import { WhatsAppBot } from "../../../whatsapp_bot";
import vCard from 'vcard-parser';

export default class AddCommand extends ICommand {
    command: string = "add";
    help: string = "Add a user to the group using a phone number or vcard";

    allowPMs: boolean = false;
    groupPrivilegeLevel: GroupPrivilegeLevel = GroupPrivilegeLevel.Admin;

    async execute(client: WASocket, message: MessageModel, body?: string) {
        const adminMap = await getGroupPrivilegeMap(client, message.to);
        const iAmAdmin: boolean = adminMap[WhatsAppBot.currentClientId!] > 0;

        if (!iAmAdmin) {
            return await messagingService.reply(message, "Give the bot admin access in order to use this command.", true);
        } else if (!message.raw) {
            return await messagingService.reply(message, "There seems to have been an error. Please try again.", true);
        }

        let vcards = message.raw.message?.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage?.vcard
            || message.raw.message?.extendedTextMessage?.contextInfo?.quotedMessage?.contactsArrayMessage?.contacts!.map((contact) => contact.vcard) || [];

        if (vcards) {
            const allNumbers = new Set<string>();
            if (vcards && typeof vcards == typeof "") {
                vcards = [vcards as string]
            }

            (vcards as string[]).forEach(async (vcard) => {
                const vc = vCard.parse(vcard)
                const numbers = vc.tel.map((telObject) => (telObject.meta.waid + "@s.whatsapp.net"))
                const onWhatsapp = await client.onWhatsApp(...numbers);
                onWhatsapp.forEach(element => {
                    if (element.exists) allNumbers.add(element.jid);
                });
            });

            const numbersList = Array.from(allNumbers);

            try {
                await client.groupParticipantsUpdate(message.to, numbersList, 'add')
            } catch (err) {
                return messagingService.reply(message, "Failed 😢", true);
            }

            return messagingService.reply(message, "Success 🎊", true);
        }

        if (!body) {
            return messagingService.reply(message, "You must either provide a body with phone numbers or contact vcards", true);
        }

        const numbers = [...body.matchAll(/\d+/gim)].map(num => {
            let number = parseInt(num[0]).toString();
            if (number.startsWith("5")) {
                number += '972';
            }
            return number;
        });
        const onWhatsappNumbers = (await client.onWhatsApp(...numbers)).filter(res => res.exists).map(res => res.jid);

        try {
            await client.groupParticipantsUpdate(message.to, onWhatsappNumbers, 'add')
        } catch (err) {
            return messagingService.reply(message, "Failed 😢", true);
        }

        return messagingService.reply(message, "Success 🎊", true);
    }
}
