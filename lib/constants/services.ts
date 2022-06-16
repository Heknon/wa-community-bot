import { CommandHandler } from "../core/command/command_handler";
import { ListenerHandler } from "../core/listener/listener_handler";
import MessagingService from "../core/messaging_service";
import UserRepository from "../user/user_repository";

export const listenerHandler = new ListenerHandler()
export const userCommandHandler = new CommandHandler(undefined, undefined);
export const userRepository = new UserRepository();
export const messagingService = new MessagingService();