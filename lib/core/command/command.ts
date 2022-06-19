import { proto, WAMessage, WASocket } from "@adiwajshing/baileys";
import MessageModel from "../../database/models/message_model";
import Privileged from "../privileged";

export abstract class ICommand extends Privileged {
  command?: string;
  help?: string;
  help_category?: string;

  execute(client: WASocket, message: MessageModel, body?: string): Promise<any> | any {
    throw new Error("Not implemented");
  }
}

