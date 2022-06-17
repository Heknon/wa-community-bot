import { WhatsAppBot } from "./whatsapp_bot";
import { BaileysEventEmitter } from "@adiwajshing/baileys";
import { connectToDatabase } from "./database";
import { userCommandHandler, listenerHandler, messagingService, userRepository } from "./constants/services";
import JIDCommand from "./command/admin/jid_command";
import TestCommand from "./command/admin/test_command";
import UserUpdaterListener from "./user/user_creator_listener";
import StickerCommand from "./command/fun/sticker_command";
import HelpCommand from "./command/info/help_command";
import MP3Command from "./command/fun/mp3_command";

export const whatsappBot: WhatsAppBot = new WhatsAppBot("./session", registerEventHandlers);
connectToDatabase();
whatsappBot.start();

listenerHandler.setClient(whatsappBot.client!);
userCommandHandler.setClient(whatsappBot.client!);
messagingService.setClient(whatsappBot.client!);

registerListeners();
userCommandHandler.registerCommandListener(listenerHandler);
registerCommands();

function registerEventHandlers(eventListener: BaileysEventEmitter, bot: WhatsAppBot) {
  eventListener?.on("messages.upsert", async (chats) => {
    for (const message of chats.messages) {
      if (message.message?.protocolMessage) return;

      if (message?.key?.participant?.includes(":") ?? false) {
        message.key!.participant = message?.key!.participant?.split(":")[0] + '@s.whatsapp.net';
      }

      const msgModel = await messagingService.messageInterceptor(message);

      const listeners = await listenerHandler.findListeners(msgModel);
      await listenerHandler.executeListeners(msgModel, ...listeners);
    }
  });
}

function registerListeners() {
  listenerHandler.registerListener(new UserUpdaterListener(userRepository));
}

function registerCommands() {
  userCommandHandler.registerCommand(new JIDCommand());
  userCommandHandler.registerCommand(new TestCommand());
  userCommandHandler.registerCommand(new StickerCommand());
  userCommandHandler.registerCommand(new MP3Command());
  userCommandHandler.registerCommand(new HelpCommand(userCommandHandler));
}

