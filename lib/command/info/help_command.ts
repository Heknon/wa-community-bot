import {
    proto,
    WASocket,
} from "@adiwajshing/baileys";
import { messagingService } from "../../constants/services";
import MessageModel from "../../database/models/message_model";
import { PrivilegeLevel } from "../../database/models/user/privilege_level";
import { ICommand } from "../../core/command/command";
import { CommandHandler } from "../../core/command/command_handler";


export default class HelpCommand extends ICommand {
    command: string = "help";
    help: string = "This message"
    help_category: string = 'Info';

    private commandHandler: CommandHandler;

    constructor(commandHandler: CommandHandler) {
        super();
        this.commandHandler = commandHandler;
    }

    async execute(client: WASocket, message: MessageModel, body?: string) {
        const allCommands = this.commandHandler.commands;
        const filteredCommands: Array<ICommand> = [];
        let sendInGroup = true;

        for (const command of allCommands) {
            if (!command.command) continue;
            if (command.command == this.command) continue;

            if (!(await command.hasPermission(message))) continue;

            if (command.privilegeLevel > PrivilegeLevel.Membership) sendInGroup = false;
            filteredCommands.push(command);
        }

        const prefix = this.commandHandler.commandPrefix;
        let helpMessage = "*----- HELP ME I'M RETARDED ----*\n";
        const sections: Map<string, proto.ISection> = new Map();
        let id = 0;
        for (const command of filteredCommands) {
            const sectionKey = command.help_category?.toLowerCase() ?? 'misc';
            if (!sections.has(sectionKey)) {
                sections.set(sectionKey, { title: command.help_category?.toUpperCase() ?? 'MISC', rows: new Array<proto.IRow>() });
            }

            const section = sections.get(sectionKey);
            section?.rows?.push({ title: prefix + command.command, description: command.help, rowId: "HELP_COMMAND-" + id, })


            // helpMessage += `${prefix + command.command}`;
            // if (command.help) helpMessage += ` - ${command.help}`;
            // helpMessage += '\n'
            id++;
        }

        // helpMessage += "@ everyone - Will tag everyone in a group chat. (Do not include the space after @) (Only available to admins)\n\n"
        if (!sections.has('misc')) {
            sections.set('misc', { title: 'MISC', rows: new Array<proto.IRow>() });
        }

        sections.get('misc')?.rows?.push({ title: '@everyone', description: 'Tag everyone in the group', rowId: "HELP_COMMAND-" + id, })
        helpMessage += "מקווה שעזרתי ✌\n";
        helpMessage += "~bot";

        if (sendInGroup) await messagingService.sendMessage(message.raw?.key.remoteJid!, {
            text: helpMessage,
            buttonText: "Click me for help!",
            sections: Array.from(sections.entries()).map((arr) => arr[1] as proto.ISection)
        }, { quoted: message.raw! });
        else {
            await messagingService.reply(message, 'Check your DMs!', true);
            await messagingService.sendMessage(message.sender, {
                text: helpMessage,
                buttonText: "Click me for help!",
                sections: Array.from(sections.entries()).map((arr) => arr[1] as proto.ISection)
            }, { quoted: message.raw! });
        }
    }
}
