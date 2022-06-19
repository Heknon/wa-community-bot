import {
  DownloadableMessage,
  downloadContentFromMessage,
  generateWAMessageFromContent,
  proto,
  WASocket,
} from "@adiwajshing/baileys";
import Sticker, { StickerTypes } from "wa-sticker-formatter/dist";
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import MessageModel from "../../database/models/message_model";

export default class StickerCommand extends ICommand {
  command: string = "sticker";
  help: string = 'Send along with an image or video to create a sticker';
  help_category: string = 'Fun';

  async execute(client: WASocket, message: MessageModel, body?: string) {
    let messageMedia = message.media ?? message.quote?.media;
    if (!messageMedia) {
      return await messagingService.reply(message, "You must send a video, image, sticker or quote one along with the command.", true);
    }

    const stickerBuffer = await this.createSticker(messageMedia).toBuffer();
    if (stickerBuffer.length < 50) {
      return await messagingService.reply(message, "You must send a video, image, sticker or quote one along with the command.", true);
    } else if (stickerBuffer.length > 2 * 1000000) { // if bigger than 2mb error.
      return await messagingService.reply(message, "The sticker you are trying to create is too large.", true);
    }

    await messagingService.replyAdvanced(message, { sticker: stickerBuffer }, true);
  }

  private createSticker(buffer: Buffer, author: string = "bot", pack: string = "bot") {
    return new Sticker(
      buffer, {
      pack: pack,
      author: author,
      type: StickerTypes.FULL,
      quality: 40,
    }
    );
  }
}
