import { AnyMessageContent, WASocket } from "@adiwajshing/baileys";
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import { Permission } from "../../core/privileged";
import MessageModel from "../../database/models/message_model";
import { PrivilegeLevel } from "../../database/models/user/privilege_level";

export default class AnonymousCommand extends ICommand {
    command: string = "anonymous";
    help: string = 'Anonymously message someone through the bot';
    help_category: string = 'Fun';

    privilegeLevel: PrivilegeLevel = PrivilegeLevel.Membership;

    override async onFailedPermission(message: MessageModel | undefined, permission: Permission, processedData?: any) {
        if (permission == Permission.PrivilegeLevel && message) {
            return messagingService.reply(message, 'A membership is needed to use this command. Sorry!', true)
        }
    }

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!message.media && !body) {
            return await messagingService.reply(message, "You must have some content you want to send in the message.", true)
        }

        const splitData = body?.split(" ") ?? []
        let number = splitData.shift();
        if (number?.startsWith('0')) number = "972" + number.substring(1);
        if (number) number += "@s.whatsapp.net";
        if (!number) {
            return await messagingService.reply(message, "You must give a phone number. '>>anonymous {phone} {content}'", true)
        }

        let content = splitData.join(" ");
        if (!message.media && content.length === 0) {
            return await messagingService.reply(message, "You must have some content you want to send in the message.", true)
        }

        if (!(await client.onWhatsApp(number))[0].exists) {
            return await messagingService.reply(message, "This number isn't on WhatsApp", true);
        }

        content = "*ANONYMOUS MESSAGE:*\n" + content;
        const msg: AnyMessageContent = message.media ? {caption: content, image: message.media} : {text: content};  
        await messagingService.sendMessage(number, msg);
        await messagingService.reply(message, "Sent! 🤫", true);
    }
}