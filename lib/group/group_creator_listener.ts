import { isJidGroup, jidDecode, jidNormalizedUser, WASocket } from "@adiwajshing/baileys";
import MessageModel from "../database/models/message_model";
import { IListener } from "../core/listener/listener";
import GroupRepository from "./group_repository";
import { messagingService } from "../constants/services";
import { WhatsAppBot } from "../whatsapp_bot";

export default class GroupUpdaterListener extends IListener {
    private groupRepository: GroupRepository;
    allowPMs = false;

    constructor(groupRepository: GroupRepository) {
        super();
        this.groupRepository = groupRepository;
    }

    async execute(client: WASocket, msg: MessageModel): Promise<void> {
        if (!isJidGroup(msg.to)) return;

        let group = await this.groupRepository.getGroup(msg.to);
        if (!group) {
            try {
                group = await this.groupRepository.createBasicGroup(msg.to);
            } catch (err) {
                group = await this.groupRepository.fetchGroup(msg.to);
            }
        }

        if (!group) return;
    }
}
