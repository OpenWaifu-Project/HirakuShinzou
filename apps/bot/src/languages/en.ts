export default {
	commands: {
		fun: {
			image: {
				disabled: "This server has image command disabled",
				disabledChannel: ({ channel }: { channel: string }) =>
					`This channel has image command disabled. Please use it in <#${channel}>`,
				insufficientTokens: [
					"You don't have enough tokens to use this command! You can get more tokens by voting for the bot on top.gg! <:gawrgurapeek:1122720762399305810>",
					"After voting, you will receive some tokens for this command! https://top.gg/bot/1095572785482444860/vote",
					"If you want to get more tokens, you can also buy a membership... [contact support server](https://discord.gg/wX576wXR6p)",
				].join("\n"),
				insufficientPermissions: "Check if I have the permissions `SEND_MESSAGES` and `ATTACH_FILES` in this channel",
				success: ({
					userId,
					tokens,
					position,
					model,
					dimension,
				}: {
					userId: string;
					tokens: number;
					position: number;
					model: string;
					dimension: string;
				}) => {
					const dateFormat = `<t:${Math.floor(Date.now() / 1000)}:R>`;
					const warning =
						model !== "anime" && dimension !== "1024x1024"
							? "The selected model only accepts square images... the resolution has been changed"
							: "";

					return [
						`<@${userId}> Your image has been added to the queue! You have **${tokens}** tokens left <a:KannaShake:1122720797971185786>`,
						`> Queue started since... ${dateFormat} (On position ${position})`,
						`${warning}`,
					].join("\n");
				},
				insufficentMembership: [
					"Your current membership does not allow you to use this model... you can upgrade your membership in our patreon!",
					"https://www.patreon.com/HirakuShinzou",
				].join("\n"),
				filter: {
					triggered: ({
						flags,
					}: {
						flags: string[];
					}) => {
						return [
							"Ehm... I have detected that the prompt entered may not be appropriate for the channel you are currently in... <:guraglance:1122720755935883385>",
							"Please confirm me if you want to continue with this generation... or go to a more appropriate channel <:MarisaThinking:1122799984107077683>",
							`> Triggered filter flags: \`${flags
								.map((e, index) => (index + 1 !== flags.length ? `${e},` : e))
								.join(" ")}\``,
						].join("\n");
					},
					denied:
						"I understand, I have cancelled your generation and returned your tokens... I will be waiting for the next one! <:HirakuWink:1180310212444438649>",
					notReplied:
						"You're taking too much time... you can go get a coffee and ask me again later, I'm not moving <a:KannaShake:1122720797971185786>",
					highFilter: "What the f..., what are you doing there huh? 🔫",
					noValidChannel: [
						"The prompt seems to be only appropriate for channels marked NSFW... please redirect to one.",
						"> Are you an admin? Use `/manage image filter` to disable NSFW filter on SFW channels.",
					].join("\n"),
					noValidChannelEmbed:
						"**The servers are responsible for what users do with the bot, if you disable this filter it is your responsibility to moderate what is done with the images.**",
					filterProblem:
						"I can't continue with this generation right now... try again later! <:hutaosad:1122720782884274267>",
				},
			},
			img2img: {
				disabled: "This server has img2img command disabled",
				disabledChannel: ({ channel }: { channel: string }) =>
					`This channel has img2img command disabled. Please use it in <#${channel}>`,
				fetchError: ({ userId }: { userId: string }) =>
					`I couldn't generate the image... <@${userId}> please try again with other picture.`,
				insufficientTokens: [
					"You don't have enough tokens to use this command! You can get more tokens by voting for the bot on top.gg! <:gawrgurapeek:1122720762399305810>",
					"After voting, you will receive some tokens for this command! https://top.gg/bot/1095572785482444860/vote",
					"If you want to get more tokens, you can also buy a membership... [contact support server](https://discord.gg/wX576wXR6p)",
				].join("\n"),
				insufficientPermissions: "Check if I have the permissions `SEND_MESSAGES` and `ATTACH_FILES` in this channel",
				success: ({
					userId,
					tokens,
					position,
					model,
					dimension,
				}: {
					userId: string;
					tokens: number;
					position: number;
					model: string;
					dimension: string;
				}) => {
					const dateFormat = `<t:${Math.floor(Date.now() / 1000)}:R>`;
					const warning =
						model !== "anime" && dimension !== "1024x1024"
							? "The selected model only accepts square images... the resolution has been changed"
							: "";

					return [
						`<@${userId}> Your image has been added to the queue! You have **${tokens}** tokens left <a:KannaShake:1122720797971185786>`,
						`> Queue started since... ${dateFormat} (On position ${position})`,
						`${warning}`,
					].join("\n");
				},
			},
			ask: {
				noRequiredMembership: "You can't use this model with your current membership plan.",
				insufficientTokens: ({ requiredTokens }: { requiredTokens: number }) =>
					`You need ${requiredTokens} tokens to use this model.`,
				responseError: "Uhhh... sorry but I couldn't think of a response to that :BocchiOverload:",
				noResponse: "No response",
			},
		},
		info: {
			guide: {
				introduction: [
					{
						title: "Introduction",
						content: [
							"The Hiraku image generation module is a powerful tool but it can be a bit confusing to use for people who have not been exposed to AI image generation before.",
							"Here are the main concepts you should have to get started.",
							"- Use [danbooru](https://safebooru.donmai.us/posts) tags (proompting).",
							"- Prompt negative.",
							"- Enhance.",
							"- Proper dimensions for your image.",
							"",
							"**All these points will be covered in more detail in the following pages of the guide. Use the context menu to navigate between sections.**",
						],
						image: "https://i.imgur.com/HCvmlOx.png",
					},
				],
				prompting: [
					{
						title: "Use of danbooru tags",
						content: [
							"The image generation model was trained with tags belonging to the [Danbooru/Safebooru English-based image boards](https://safebooru.donmai.us/posts) web site. This means that all generation should follow the same format and tags that are usually used when describing these images.",
							"In this case the link is given to Safebooru which is the SFW version of the Daaboru, if you want to investigate further google it.",
							"",
							"It is possible that the model understands simple sentences, but ideally only tags should be used. You can use Safebooru/Danbooru to search for the tags you find necessary.",
							"",
							"Good prompt.",
							"```diff",
							"+ 1girl, blue hair, short hair, blue eyes```",
							"Bad prompt.",
							"```diff",
							"- A girl with short blue hair and blue eyes```",
						],
						image: "https://i.imgur.com/s0OfqeV.png",
					},
					{
						title: "Better or worse tags",
						content: [
							"There are certain tags that can be considered better when generating an image, although these depend a lot on the context and it is recommended that you try to find your own standard, here are some recommendations.",
							"",
							"- Use popular tags. The more used the tag is the more likely that the model can recognize it correctly, this is not a guarantee but a precaution.",
							"- Specify the camera angle with tags. For example, `cowbow shot`.",
							"- Experiment. There are thousands of tags available and while many may return good results, others simply do not work on the model and you will have to look for alternatives to get what you want.",
							"[List of tags categories](https://safebooru.donmai.us/wiki_pages/tag_groups)",
						],
						image: "https://i.imgur.com/M1TAtfW.png",
					},
					{
						title: "Working with characters",
						content: [
							"The model is capable of recreating many well known and not so well known anime characters by simply adding their name **(based on the tag in danbooru)** to the prompt.",
							"The more danbooru images this character has, the more likely it will be able to generate the details correctly. The way we recommend to do this is with the format: `Character_Name (Series_Name)`. ",
							"",
							"Example with Tatsumaki (2.8k~ images) and Nejire Hado (700~ images). Prompts used for the examples: `Tatsumaki (one-punch man)` and `Hadou Nejire (my hero academia)`.",
						],
						image: "https://i.imgur.com/rFpSx9p.png",
					},
					{
						title: "Working with artists",
						content: [
							"As with the characters, the model is able to mimic the style of artists who commonly post their art on sites such as [Safebooru/Danbooru](https://safebooru.donmai.us/posts). Having the same concept of use as with the characters.",
							"",
							"The way we recommend implementing these styles is by using prompt strength (explained on next page). Example: `{{ARTIST}}`",
						],
						image: "https://i.imgur.com/hnOfMSp.png",
					},
					{
						title: "Prompt strength",
						content: [
							"The way to handle forces in the image module is to use braces or brackets.",
							"> {TAG} = More strength",
							"> [TAG] = Less strength",
							"",
							"**It is possible to surround tags multiple times to make the prompt have more or less weight. Example: {{1girl}}**",
						],
						image: "https://i.imgur.com/zhhPwWU.png",
					},
					{
						title: "Undesired content",
						content: [
							"The undesired content is a very useful tool when generating images, it allows you to specify what you do not want to see in the generated image.",
							"To use it just add the unwanted tags inside the `negative-prompt` option of the slash command.",
						],
						image: "https://i.imgur.com/1q7tbHm.png",
					},
					{
						title: "Working with template tags",
						content: [
							"The template tag is a feature that allows you to save specific tags in a single tag, facilitating the use of the command to generate images.",
							"The way to create these tags is with the command `/util tag-create <prompt>, <tags>`. Being <prompt> the template tag and <tags> the tags it represents.",
							"",
							"Example. if we have a template tag `hikaru`, which represents the tags <blue hair, short hair, blue eyes, small breast>, the way to use it when generating an image would be:",
							"`/fun image %hikaru%`",
						],
						image: "https://i.imgur.com/WNfiPJ6.png",
					},
					{
						title: "SMEA (ANIME MODEL ONLY OPTION)",
						content: [
							"Briefly, it is a modification of the sampler that allows to be able to get to improve the overall image quality by making multiple passes while processing on the image, this itself can lead to certain advantages and problems.",
							"```diff",
							"+ Better image quality.",
							"+ More detail and fixing of problems (such as hands).",
							"+ Somewhat smoother style.",
							"* Changes in the style you want to get to.",
							"```",
							"**But then... there doesn't seem to be much loss when using it, should I then activate it?**",
							"There are people who prefer the normal style and others using SMEA",
						],
						image: "https://i.imgur.com/WTRehSY.png",
					},
				],
			},
			history: {
				noImages: "You haven't generated any images yet!",
			},
			ping: {
				success: ({ ping }: { ping: number }) => {
					return `The actual ping is \`${ping}\``;
				},
			},
			support: {
				success: "You can join the support server here: https://discord.gg/wX576wXR6p <:KannaPog:1122720808104644620>",
			},
			tags: {
				noTags: "You don't have any tags!",
			},
		},
		manage: {
			language: {
				success: ({ language }: { language: string }) => `The guild language has been updated to **${language}**`,
			},
			image: {
				blur: {
					success: ({ status }: { status: string }) => `The blur has been ${status}`,
				},
				channel: {
					disabled: "Now image commands can be used in any channel",
					missingChannel: "You need to specify a channel to enable this feature",
					success: ({ channel }: { channel: string }) => `Now the images can be only generated in <#${channel}>`,
				},
				status: {
					success: ({ status }: { status: string }) => `The image module has been ${status}`,
				},
				filter: {
					success: ({ status }: { status: string }) => `The filter has been ${status}`,
				},
				filterFail: {
					success: ({ status }: { status: string }) =>
						`Force generation on SFW channels even if the filter fails: ${status}`,
				},
			},
			chat: {
				reset: {
					success: "The chatbot history has been reset for this guild",
				},
			},
		},
		membership: {
			profile: {
				lastClaimed: "Last claimed vote",
				voteStrike: "Vote streak (updated every claim)",
				imageStats: "Image Stats",
				totalImages: "Total Images",
				chatStats: "Chat Stats",
			},
			claim: {
				userMissingInGuild: [
					"I couldn't find you inside my support server... Please [join my server](https://discord.gg/amZp7dyQeK) before using this command!",
					"If you are already on my server and you still get this message... you can go to <#1095625314731823135> and report this problem! <:zerotwo:1122720774768300042>",
				].join("\n"),
				noMembershipFound: [
					"I couldn't verify that you have an active membership... You can buy from my [official Patreon](https://www.patreon.com/hirakushinzou/membership)",
					"If you have already purchased a subscription and you are still receiving this message... you can go to <#1095625314731823135> and report this problem! <:zerotwo:1122720774768300042>",
				].join("\n"),
				success: ({ membership, tokens }: { membership: string; tokens: number }) =>
					[
						`Your account has been upgraded to plan **${membership}**! You have been given:`,
						`> ${tokens} Image Tokens!`,
						"To get your plan information, use the /membership info command, to view your account information, use the /util profile command!",
					].join("\n"),
				alreadyClaimed: "You already have an active membership!",
				timeAlready: "Debe esperar al menos 30 días para volver a canjear tu membresía!",
			},
		},
		util: {
			config: {
				success: "Your settings have been updated!",
			},
			createTag: {
				successUpdate: "Your tag has been updated",
				existingTag: "You already have a tag with that prompt! Would you like to update it?",
				successCreate: "Your tag has been created!",
				failed: "Tag not updated!",
			},
			deleteTag: {
				success: "The tag was deleted correctly",
				notFound: "The tag was not found",
			},
		},
	},
	welcomeGuild: {
		message: [
			"Hello! I'm Hiraku, thanks for adding me to your server!. I hope you enjoy my features!",
			"",
			"There is a small list of commands that you can use:",
			"</fun image:1176327062060023848> - Generates an image in base to the prompt given",
			"</fun image2img:1176327062060023848> - Generates an image in base to the prompt given (with an image)",
			"</fun ask:1176327062060023848> - Ask something to an IA",
			"</info image-guide:1122722096632574044> - Shows a guide on how to use the image command",
			"</info tags:1122722096632574044> - Shows your tags",
			"</membership profile:1196299953035821107> - Shows your profile",
			"",
			"Also you can talk with me by mentioning me and writing something!, example: `@Hiraku Shinzou Hello!`",
			"",
			"> If you have any questions, you can go to the support server: https://discord.gg/6AQAeUPTFb",
		],
	},
	global: {
		on: "Enabled",
		off: "Disabled",
		none: "None",
	},
	imageGenerated: {
		blurWarning: "The image has been blurred because the blur option is enabled in this server.",
		imageReady: "Your image has been generated!",
		error: "I couldn't generate the image... please try again later.",
	},
};
