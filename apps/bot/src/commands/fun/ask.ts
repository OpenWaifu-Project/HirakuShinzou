import { UserService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Options, SubCommand, createStringOption } from "seyfert";
import { Embed } from "seyfert/lib/builders";
import { constants } from "../../lib/constants";
import { createChatCompletion } from "../../lib/scripts/createChatCompletion";

const options = {
	question: createStringOption({
		description: "The question to ask",
		required: true,
	}),
	model: createStringOption({
		description: "The model to use",
		required: false,
		choices: [
			{ name: "GPT 3.5 Turbo", value: "OPENAI-URL_gpt-3.5-turbo-1106" },
			{ name: "GPT 4", value: "OPENAI-URL_gpt-4" },
			{ name: "GPT 4 Turbo", value: "OPENAI-URL_gpt-4-1106-preview" },
			{
				name: "GPT 4 Turbo Vision",
				value: "OPENAI-URL_gpt-4-vision-preview",
			},
		] as const,
	}),
};

@Declare({
	name: "ask",
	description: "Ask a question to an AI",
})
@Options(options)
export default class AskCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;

	async run(context: CommandContext<typeof options, "prepare">) {
		const { question, model: selectedModel = "OPENAI-URL_gpt-3.5-turbo-1106" } = context.options;

		const [type, model] = selectedModel.split("_") as [
			keyof typeof constants.COMPLETION_APIS,
			keyof typeof constants.CHATBOT_MODELS,
		];

		const { user } = context.metadata.prepare;
		const lang = context.metadata.prepare.lang.commands.fun.ask;

		const usedModel = constants.CHATBOT_MODELS[model];

		if ((usedModel.disallowedMembership as string[]).includes(user.membership.plan)) {
			return context.editResponse({
				content: lang.noRequiredMembership,
			});
		}

		if (usedModel.requiredTokens > user.tokens.chat) {
			return context.editResponse({
				content: lang.insufficientTokens({
					requiredTokens: usedModel.requiredTokens,
				}),
			});
		}

		const response = await createChatCompletion(
			type,
			{
				model,
				frequency_penalty: 0.1,
				max_tokens: 500,
				presence_penalty: 0.1,
				top_p: 1,
				temperature: 0.9,
			},
			[{ content: question, role: "user" }]
		);

		if (response.error)
			return context.editResponse({
				content: lang.responseError,
			});

		const embedResponse = new Embed()
			.setAuthor({
				name: `${context.author.username} - ${usedModel.name}`,
				iconUrl: context.author.avatarURL(),
			})
			.setColor(4405450)
			.setDescription(response.choices[0]?.message.content || lang.noResponse)
			.setFooter({
				text: `Powered by ${usedModel.company}`,
				iconUrl: usedModel.logo,
			});

		await context.editResponse({ embeds: [embedResponse] });
		await this.userService.updateTokens(context.author.id, "chat", -usedModel.requiredTokens);

		return;
	}
}
