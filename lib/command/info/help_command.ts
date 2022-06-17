import {
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
        for (const command of filteredCommands) {
            helpMessage += `${prefix + command.command}`;
            if (command.help) helpMessage += ` - ${command.help}`;
            helpMessage += '\n'
        }

        helpMessage += "@ everyone - Will tag everyone in a group chat. (Do not include the space after @) (Only available to admins)"
        helpMessage += "מקווה שעזרתי ✌\n";
        helpMessage += "~bot";

        await messagingService.reply(message, helpMessage, true, !sendInGroup);
        if (!sendInGroup) await messagingService.reply(message, "Look at your DMs!", true);
    }
}
