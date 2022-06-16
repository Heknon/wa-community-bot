import { proto, WAMessage, WASocket } from "@adiwajshing/baileys";
import MessageModel from "../../database/models/message_model";
import Privileged from "../privileged";

export abstract class ICommand extends Privileged {
  command: string = "default";
  execute(client: WASocket, message: MessageModel, body?: string): Promise<void> | void {
    throw new Error("Not implemented");
  }
}

