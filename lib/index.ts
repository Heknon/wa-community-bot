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
import GptCommand from "./command/info/gpt_command";
import LmgtfyCommand from "./command/fun/lmgtfy_command";
import GtfoCommand from "./command/groups/admin/gtfo_command";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import ffmpeg from 'fluent-ffmpeg';
import JoinCommand from "./command/groups/outreach/join_command";
ffmpeg.setFfmpegPath(ffmpegPath);

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

  eventListener?.on("groups.upsert", async (groupMetas) => {
    const joinMessage = "**Disclaimer**\n\
    This bot is handled and managed by Ori Harel.\n\
    As such, he poses the ability to see the messages in this group chat.\n\
    He does not plan to but the possibility is there.\n\
    If you are not keen with this, please remove the bot.\n\n\
    You can remove the bot by having a group admin send:\n\
    >>gtfo\n\
    Enjoy my bot! Get started using: >>help";

    for (const meta of groupMetas) {
      await messagingService.sendMessage(meta.id, {"text": joinMessage});
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
  userCommandHandler.registerCommand(new GptCommand());
  userCommandHandler.registerCommand(new LmgtfyCommand());
  userCommandHandler.registerCommand(new GtfoCommand());
  userCommandHandler.registerCommand(new JoinCommand());
  userCommandHandler.registerCommand(new HelpCommand(userCommandHandler));
}

