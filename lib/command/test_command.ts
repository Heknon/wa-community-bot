import {
    AnyMessageContent,
    WASocket,
} from "@adiwajshing/baileys";
import { messagingService } from "../constants/services";
import { ICommand } from "../core/command/command";
import MessageModel from "../database/models/message_model";
import { PrivilegeLevel } from "../database/models/user/privilege_level";


export default class TestCommand extends ICommand {
    command: string = "test";
    privilegeLevel = PrivilegeLevel.Admin;

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!message.raw?.key.remoteJid) return;

        const buttons = [
            { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
            { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 },
            { buttonId: 'id3', buttonText: { displayText: 'Button 3' }, type: 1 }
        ]

        const templateButtons = [
            { index: 1, urlButton: { displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys' } },
            { index: 2, callButton: { displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901' } },
            { index: 3, quickReplyButton: { displayText: '>>jid', id: 'id-like-buttons-message' } },
        ]

        const buttonMessage: AnyMessageContent = {
            image: { url: 'https://www.industrialempathy.com/img/remote/ZiClJf-1920w.jpg' },
            caption: "Hi it's button message",
            footer: 'Hello World',
            title: 'hmmm',
            buttons: buttons
        }

        const buttonMessage2: AnyMessageContent = {
            image: { url: 'https://www.industrialempathy.com/img/remote/ZiClJf-1920w.jpg' },
            caption: "Hi it's button message",
            title: 'hmmm',
            footer: 'Hello World',
            templateButtons: templateButtons
        }

        const sections = [
            {
                title: "Section 1",
                rows: [
                    { title: "Option 1", rowId: "option1" },
                    { title: "Option 2", rowId: "option2", description: "This is a description" }
                ]
            },
            {
                title: "Section 2",
                rows: [
                    { title: "Option 3", rowId: "option3" },
                    { title: "Option 4", rowId: "option4", description: "This is a description V2" }
                ]
            },
        ]

        const listMessage: AnyMessageContent = {
            text: "This is a list",
            footer: "nice footer, link: https://google.com",
            title: "Amazing boldfaced list title",
            buttonText: "Required, text on the button to view the list",
            sections,
            templateButtons,
        }

        await messagingService.replyAdvanced(message, buttonMessage)


        await messagingService.replyAdvanced(message, buttonMessage2)

        await messagingService.replyAdvanced(message, listMessage)
    }
}
