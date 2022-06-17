import { proto, WASocket } from "@adiwajshing/baileys";
import { Configuration, OpenAIApi } from "openai";
import { messagingService } from "../../constants/services";
import { ICommand } from "../../core/command/command";
import MessageModel from "../../database/models/message_model";

export default class GptCommand extends ICommand {
    command: string = "gpt";
    help: string = 'Ask an AI a question'

    configuration: Configuration;
    openai: OpenAIApi;

    private texts = ['Hmmmm, let me think about this one...', 'Huh.... Interesting...', "I mean... I'll give it my best try.", 'No clue. Well I mean... Hmmmmm....'];

    constructor() {
        super();
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.openai = new OpenAIApi(this.configuration);
    }

    async execute(client: WASocket, message: MessageModel, body?: string) {
        if (!body) {
            return await messagingService.reply(message, 'You must ask something.');
        }

        messagingService.reply(message, this.texts[Math.floor(Math.random() * this.texts.length)], true)

        this.openai.createCompletion({
            model: "text-davinci-002",
            prompt: body,
            temperature: 0.7,
            max_tokens: 3700,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then((response) => {
            const blank = "Couldn't think of anything\nI'm blank!";
            console.log(response.data.choices);
            const text = response.data.choices ? response.data.choices[0].text ?? blank : blank;
            messagingService.reply(message, text, true);
        }).catch((err) => {
            messagingService.reply(message, "That's way too long for me", true);
        });
    }
}