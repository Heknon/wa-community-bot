import { WhatsAppBot } from "./whatsapp_bot";
import { BaileysEventEmitter } from "@adiwajshing/baileys";
import { connectToDatabase } from "./database";
import { userCommandHandler, listenerHandler, messagingService, userRepository } from "./constants/services";
import JIDCommand from "./command/jid_command";
import TestCommand from "./command/test_command";
import UserCreatorListener from "./user/user_creator_listener";

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
      if (whatsappBot.client?.processMessage)
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
  listenerHandler.registerListener(new UserCreatorListener(userRepository));
}

function registerCommands() {
  userCommandHandler.registerCommand(new JIDCommand());
  userCommandHandler.registerCommand(new TestCommand());
}

