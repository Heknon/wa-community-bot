import {  WASocket } from "@adiwajshing/baileys";
import MessageModel from "../database/models/message_model";
import { IListener } from "../core/listener/listener";
import UserRepository from "./user_repository";

export default class UserUpdaterListener extends IListener {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super();
        this.userRepository = userRepository;
    }

    async execute(client: WASocket, msg: MessageModel): Promise<void> {
        await this.userRepository.getUser(msg.sender, msg.raw?.pushName ?? undefined, true, true);
    }
}
