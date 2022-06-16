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
  filter(message: MessageModel): Promise<boolean> | boolean  {
    return true;
  }
  execute(client: WASocket, message: MessageModel): Promise<void> | void  {
    throw new Error("Not implemented");
  }
}

export class Listener extends IListener {
  blacklist: string[];
  whitelist: string[];

  filterer: (message: MessageModel) => boolean;
  executor: (client: WASocket, message: MessageModel) => void | Promise<void>;

  constructor(
    filterer: (message: MessageModel) => boolean,
    executor: (client: WASocket, message: MessageModel) => void | Promise<void>,
    blacklist: string[] = [],
    whitelist: string[] = []
  ) {
    super()
    this.blacklist = blacklist;
    this.whitelist = whitelist;
    this.filterer = filterer;
    this.executor = executor;
  }

  filter(message: MessageModel): boolean {
    return this.filterer(message);
  }

  execute(client: WASocket, message: MessageModel): void | Promise<void> {
    return this.executor(client, message);
  }
}
