import { extractMessageContent, generateWAMessageFromContent, proto, WAMessage } from '@adiwajshing/baileys';
import { title } from 'process';
import MessageModel from '../database/models/message_model';
import { WhatsAppBot } from '../whatsapp_bot';

export function getQuotedMessage(message?: MessageModel) {
    return getQuotedMessageRaw(message?.raw ?? undefined);
}

export function getQuotedMessageRaw(message?: WAMessage) {
    const contextInfo = getContextInfoRaw(message);

    if (!contextInfo) return;

    let quoted = generateWAMessageFromContent(
        contextInfo?.remoteJid ?? contextInfo.participant!, contextInfo?.quotedMessage!,
        { messageId: contextInfo?.stanzaId!, userJid: contextInfo?.participant! }
    )
    quoted.key = {
        'fromMe': contextInfo?.participant! == WhatsAppBot.currentClientId,
        'id': contextInfo?.stanzaId!,
        'participant': contextInfo?.participant!,
        'remoteJid': contextInfo.remoteJid,
    }
    
    return quoted;
}

export function getContextInfo(message?: MessageModel) {
    return getContextInfoRaw(message?.raw ?? undefined);
}

export function getContextInfoRaw(message?: WAMessage) {
    const content = extractMessageContent(message?.message);
    if (!content) return;

    return [content.extendedTextMessage?.contextInfo, content.imageMessage?.contextInfo,
        content.videoMessage?.contextInfo, content.stickerMessage?.contextInfo,
        content.audioMessage?.contextInfo, content.documentMessage?.contextInfo,
        content.contactMessage?.contextInfo, content.contactsArrayMessage?.contextInfo,
        content.buttonsResponseMessage?.contextInfo, content.templateButtonReplyMessage?.contextInfo,
        content.listResponseMessage?.contextInfo, content.locationMessage?.contextInfo,
        content.liveLocationMessage?.contextInfo, content.templateMessage?.contextInfo,
        content.buttonsMessage?.contextInfo, content.listMessage?.contextInfo].filter(e => e?.quotedMessage)[0];
}

export function getMessageBody(message?: MessageModel) {
    return getMessageBodyRaw(message?.raw ?? undefined);
}

export function getMessageBodyRaw(message?: WAMessage) {
    const content = extractMessageContent(message?.message);
    if (!content) return;

    let result = content.conversation ?? content.extendedTextMessage?.text
        ?? content.imageMessage?.caption ?? content.videoMessage?.caption
        ?? content.buttonsResponseMessage?.selectedDisplayText ?? content.templateButtonReplyMessage?.selectedDisplayText;

    if (!result) {
        if (content.listResponseMessage) {
            result = content.listResponseMessage.title;
            if (content.listResponseMessage.description && content.listResponseMessage.description.length > 0)
                result += '\n' + content.listResponseMessage.description
        }
    }

    return result;
}

