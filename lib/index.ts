import { WhatsAppBot } from "./whatsapp_bot";
import { BaileysEventEmitter } from "@adiwajshing/baileys";
import { connectToDatabase } from "./database";
import { userCommandHandler, listenerHandler, messagingService, groupRepository, userRepository } from "./constants/services";
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
import dotenv from 'dotenv';
import JoinCommand from "./command/groups/outreach/join_command";
import GroupUpdaterListener from "./group/group_creator_listener";
import AnonymousCommand from "./command/fun/anonymous_command";
import CreatorCommand from "./command/info/creator_command";
import KickCommand from "./command/groups/admin/kick_command";
import AddCommand from "./command/groups/admin/add_command";
import SpoofCommand from "./command/fun/spoof_command";
ffmpeg.setFfmpegPath(ffmpegPath);
dotenv.config();

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
    for (const meta of groupMetas) {
      let group = await groupRepository.getGroup(meta.id);
      if (!group) {
        try {
          group = await groupRepository.createBasicGroup(meta.id);
        } catch (err) {
          group = await groupRepository.fetchGroup(meta.id);
        }
      }

      if (!group) return;

      const joinMessage = "**Disclaimer**\
      \nThis bot is handled and managed by Ori Harel.\
      \nAs such, he poses the ability to see the messages in this chat.\
      \nHe does not plan to but the possibility is there.\
      \nIf you are not keen with this, do not send the bot messages.\
      \nEnjoy my bot! Get started using: >>help";
      await messagingService.sendMessage(meta.id, { "text": joinMessage });
      await groupRepository.updateGroupDB(group.model.jid, { sentDisclaimer: true });
    }
  });
}

function registerListeners() {
  listenerHandler.registerListener(new UserUpdaterListener(userRepository));
  listenerHandler.registerListener(new GroupUpdaterListener(groupRepository));
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
  userCommandHandler.registerCommand(new CreatorCommand());
  userCommandHandler.registerCommand(new AnonymousCommand());
  userCommandHandler.registerCommand(new KickCommand());
  userCommandHandler.registerCommand(new AddCommand());
  userCommandHandler.registerCommand(new SpoofCommand());
  userCommandHandler.registerCommand(new HelpCommand(userCommandHandler));
}

