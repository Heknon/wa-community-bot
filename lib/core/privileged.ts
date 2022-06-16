import { isJidGroup, isJidUser, WAMessage } from "@adiwajshing/baileys";
import { whatsappBot } from "..";
import { userRepository } from "../constants/services";
import MessageModel from "../database/models/message_model";
import { PrivilegeLevel } from "../database/models/user/privilege_level";
import { GroupPrivilegeLevel } from "../database/models/whatsapp/group_privilege_level";
import { getUserPrivilegeLevel } from "../utils/group_utils";

export default abstract class Privileged {
    /**
     * A list of all users (JID) banned from processing
     */
    blacklist: string[] = [];

    /**
     * privilege level of sender in group chat
     */
    groupPrivilegeLevel: GroupPrivilegeLevel = 0;

    /**
     * privilege level in the database
     */
    privilegeLevel: PrivilegeLevel = 0;

    /**
     * Allow processing in group chats
     */
    allowGroups: boolean = true;

    /**
     * Allow processing in private messages
     */
    allowPMs: boolean = true;

    /**
     * Whether a message is needed to pass privilege test
     * This is usually true. In some cases you may not receive a message with a commmand.
     */
    messageNeeded: boolean = true

    /**
     * Called when sender fails a permission check
     * @param permission Permission that sender failed to pass.
     * @param processedData data that was processed in order to verify permission
     */
    protected onFailedPermission(message: MessageModel | undefined, permission: Permission, processedData?: any): Promise<void> | void {

    }

    async hasPermission(message: MessageModel | undefined): Promise<boolean> {
        if (!this.messageNeeded && !message) return true;

        if (!message) {
            await this.onFailedPermission(undefined, Permission.MessageNeeded, undefined);
            return false;
        }

        if (!this.allowGroups && isJidGroup(message.raw?.key.remoteJid!)) {
            await this.onFailedPermission(message, Permission.AllowGroups, message.raw?.key.remoteJid);
            return false;
        }

        if (!this.allowPMs && isJidUser(message.raw?.key.remoteJid!)) {
            await this.onFailedPermission(message, Permission.AllowPMs, message.raw?.key.remoteJid);
            return false;
        }

        if (this.blacklist.length > 0) {
            if (this.blacklist.includes(message.from)) {
                await this.onFailedPermission(message, Permission.Blacklist, message.from);
                return false;
            }

            if (isJidGroup(message.to) && this.blacklist.includes(message.to)) {
                await this.onFailedPermission(message, Permission.Blacklist, message.to);
                return false;
            }
        }

        if (isJidGroup(message.to) && this.groupPrivilegeLevel > 0) {
            const level = await getUserPrivilegeLevel(whatsappBot.client!, message.to, message.from);
            if (level < this.groupPrivilegeLevel) {
                await this.onFailedPermission(message, Permission.GroupPrivilegeLevel, level);
                return false;
            }
        }
        

        const user = await userRepository.getUser(message.sender);
        if (!user && this.privilegeLevel > 0 || (user?.model.privilegeLevel ?? 0) < this.privilegeLevel) {
            await this.onFailedPermission(message, Permission.PrivilegeLevel, user);
            return false;
        }

        return true;
    }
}

export enum Permission {
    AllowGroups,
    AllowPMs,
    PrivilegeLevel,
    GroupPrivilegeLevel,
    Blacklist,
    MessageNeeded
}