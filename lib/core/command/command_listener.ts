import { proto, WASocket } from "@adiwajshing/baileys";
import MessageModel from "../../database/models/message_model";
import { IListener } from "../listener/listener";
import { getMessageBody } from "../../utils/message_utils";
import { command_prefix } from "../config";
import { CommandHandler } from "./command_handler";

export default class CommandListener extends IListener {
  private commandHandler: CommandHandler;
  constructor(commandHandler: CommandHandler) {
    super();
    this.commandHandler = commandHandler;
  }

  filter(message: MessageModel): boolean {
    const body = getMessageBody(message);
    return body?.trimStart()?.startsWith(command_prefix) ?? false;
  }

  async execute(client: WASocket, message: MessageModel): Promise<void> {
    const body = getMessageBody(message);
    const commandText = body?.substring(command_prefix.length).toLowerCase().trimEnd();
    if (!commandText) return;

    const commands = this.commandHandler.findCommands(commandText);
    await this.commandHandler.executeCommands(message, ...commands);
  }
}
