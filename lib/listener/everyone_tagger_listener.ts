import {
  isJidGroup,
  proto,

  WASocket,
} from "@adiwajshing/baileys";
import { messagingService } from "../constants/services";
import { IListener } from "../core/listener/listener";
import { Permission } from "../core/privileged";
import MessageModel from "../database/models/message_model";
import { GroupPrivilegeLevel } from "../database/models/whatsapp/group_privilege_level";
import { getMessageBody } from "../utils/message_utils";


export default class EveryoneTaggerListener extends IListener {
  allowPMs: boolean = false;
  groupPrivilegeLevel: GroupPrivilegeLevel = GroupPrivilegeLevel.Admin;

  filter(message: MessageModel): boolean {
    const body = getMessageBody(message)?.toLowerCase();
    return body?.includes("@everyone") ?? false;
  }

  protected onFailedPermission(message: MessageModel | undefined, permission: Permission, processedData?: any): void | Promise<void> {
    if (permission === Permission.GroupPrivilegeLevel) {
      return messagingService.reply(message, 'Only admins can tag everyone.', true);
    }
  }

  async execute(client: WASocket, message: MessageModel) {
    const group = await client.groupMetadata(message.to);

    const mentions = group.participants.map((participant) => participant.id);
    const quoted = message.quote ? message.quote.raw : message.raw;

    messagingService.sendMessage(
      message.to,
      {
        text: `${group.subject}\nEveryone!\n${mentions.map(mention => `@${mention.split("@")[0]}`).join(" ")}`,
        mentions: mentions,
      },
      { quoted: quoted ?? undefined }
    );
  }
}
