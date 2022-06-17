import { WASocket } from "@adiwajshing/baileys";
import MessageModel from "../../database/models/message_model";
import Privileged from "../privileged";

/**
 * If blacklist is empty it is considered inactive.
 * Whitelist trumps blacklist in priority.
 * If whitelist is empty it is considered inactive.
 * You can only whitelist a person but you can blacklist a group.
 */
export abstract class IListener extends Privileged {
  filter(message: MessageModel): Promise<boolean> | boolean {
    return true;
  }
  execute(client: WASocket, message: MessageModel): Promise<any> | any {
    throw new Error("Not implemented");
  }
}
