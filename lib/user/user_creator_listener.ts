import { isJidUser, WASocket } from "@adiwajshing/baileys";
import MessageModel from "../database/models/message_model";
import { IListener } from "../core/listener/listener";
import UserRepository from "./user_repository";
import { messagingService, userRepository } from "../constants/services";
import { WhatsAppBot } from "../whatsapp_bot";

export default class UserUpdaterListener extends IListener {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super();
        this.userRepository = userRepository;
    }

    async execute(client: WASocket, msg: MessageModel): Promise<void> {
        if (!isJidUser(msg.sender)) return;

        let user = await this.userRepository.getUser(msg.sender);
        if (!user) {
            try {
                user = await this.userRepository.createBasicUser(msg.sender, msg.fromMe ? undefined : msg.raw?.pushName ?? undefined, false);
            } catch (err) {
                user = await this.userRepository.fetchUser(msg.sender);
            }
        }

        if (!user) return;

        if (!msg.fromMe && user.model.name != msg.raw?.pushName) {
            user = await this.userRepository.updateUserDB(msg.sender, { pushName: msg.raw?.pushName ?? undefined })
        }

        if (!user?.model.sentDisclaimer && msg.to == WhatsAppBot.currentClientId) {
            const joinMessage = "**Disclaimer**\
            \nThis bot is handled and managed by Ori Harel.\
            \nAs such, he poses the ability to see the messages in this chat.\
            \nHe does not plan to but the possibility is there.\
            \nIf you are not keen with this, do not send the bot messages.\
            \nEnjoy my bot! Get started using: >>help";

            await messagingService.reply(msg, joinMessage);
            await this.userRepository.updateUserDB(msg.sender, { sentDisclaimer: true });
        }
    }
}
