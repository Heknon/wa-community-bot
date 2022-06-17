import { WASocket } from "@adiwajshing/baileys";
import { assert } from "console";
import MessageModel from "../../database/models/message_model";
import { ListenerHandler } from "../listener/listener_handler";
import { command_prefix } from "../config";
import { ICommand } from "./command";
import CommandListener from "./command_listener";
import { messagingService } from "../../constants/services";

export class CommandHandler {
  public commands: Array<ICommand> = [];
  protected client?: WASocket;
  private registeredListener = false;

  protected prefix = command_prefix;

  /**
   * @param client whatsapp client socket to pass to commands
   * @param listenerHandler listener handler to enable command listening. must be passed or instatiated with `registerCommandListener`
   */
  constructor(client?: WASocket, listenerHandler: ListenerHandler | undefined | null = undefined) {
    this.client = client;

    if (listenerHandler) {
      this.registerCommandListener(listenerHandler);
      this.registeredListener = true;
    }
  }

  public registerCommandListener(listenerHandler: ListenerHandler) {
    if (this.registeredListener) return;

    listenerHandler.registerListener(new CommandListener(this));
    this.registeredListener = true;
  }

  public findCommands(text: string, ...blacklist: Array<string>) {
    const commands: Array<ICommand> = [];
    const bl = new Set(blacklist);

    this.commands.forEach((command) => {
      if (!command.command) return;

      if (text.startsWith(command.command) && !bl.has(command.command)) {
        commands.push(command);
      }
    });

    return commands;
  }

  public async executeCommands(message: MessageModel, ...commands: Array<ICommand>) {
    assert(this.client, "this.client must be set through setClient(client: WASocket)");

    for (const command of commands) {
      if (!command.command) continue;
      if (!(await command.hasPermission(message))) continue;

      const body = message?.content?.slice(this.prefix.length + command.command.length + 1);
      try {
        await command.execute(this.client!, message, body);
      } catch (err) {
        console.error(err);
        await messagingService.reply(message, 'An error occurred while sending the message.')
      }
    }
  }

  public registerCommand(command: ICommand) {
    this.commands.push(command);
  }

  public setClient(client: WASocket) {
    this.client = client;
  }

  public get commandPrefix() {
    return this.prefix;
  }
}
