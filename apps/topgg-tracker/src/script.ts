import { Embed, REST, Router } from "seyfert";
import { topggSchema } from "./topgg.schema";
import { UserService } from "@repo/database";
import * as z from "zod";
import { papr } from "./papr";

const userService = new UserService(papr);

const HirakuImages = [
	"https://media.discordapp.net/attachments/1187839305788424283/1197372464846610472/artist__bee_deadflow_clear_blue_hair_short_hair_blue_eyes_dev_dev0614_s-3109237085.png?ex=65bb0701&is=65a89201&hm=287dde5417ff59bd6dc9414d83c4514e4e457810ea1334a27bc575a9d67dabb3&=&format=webp&quality=lossless&width=638&height=436",
];

const router = new Router(
	new REST({
		token: process.env.BOT_TOKEN!,
	})
).createProxy();

async function updateUser(id: string, tokens: number, streak: number) {
	await userService.updateTokens(id, "image", tokens);
	return userService.updateUser(id, {
		voteStreak: streak,
		lastVote: Date.now(),
	});
}

function resetStreak(lastVote: number, membership: keyof typeof membershipRolesIds | null): boolean {
	const tier = membership || 0;
	let streakCooldown = 8.64e7; // 24
	if (tier === "1097786564492394516") {
		// Tier I
		streakCooldown = 1.296e8; // 36
	}

	if (tier === "1097786597073752166") {
		// Tier II
		streakCooldown = 1.728e8; // 48
	}

	if (tier === "1097786598743097394") {
		// Tier III
		streakCooldown = 2.16e8; // 60
	}

	const now = Date.now();
	const diff = now - lastVote;

	if (diff >= streakCooldown) {
		return true;
	}

	return false;
}

async function processVote(data: z.infer<typeof topggSchema>) {
	const user = await userService.get(data.user);
	const userMembership = await getMembership(data.user);

	const shouldResetStreak = resetStreak(user.lastVote, userMembership);
	const streak = shouldResetStreak ? 1 : user.voteStreak + (data.isWeekend ? 2 : 1);

	const calculatedTokens = await calculateToken(streak);
	const extraTokens = userMembership ? membershipRolesIds[userMembership] : 0;

	await updateUser(data.user, calculatedTokens + extraTokens, streak);
	console.log(`[LOGS] ${data.user} received ${calculatedTokens} tokens! (+${extraTokens} for membership)`);

	const resetStreakMessage = shouldResetStreak ? "Your streak has been reset !" : "";

	const embed = new Embed()
		.setTitle("Hiraku Vote System")
		.setDescription(
			[
				"Thanks for boosting our growth through voting! Here are your rewards. Remember to vote again in 12 hours! Your votes make a big impact on the bot's journey.",
				"",
				`> +**${calculatedTokens}** Image tokens (Streak: ${streak}) ${resetStreakMessage}`,
				`> +**${extraTokens}** Extra image tokens for being a sub!`,
			].join("\n")
		)
		.setImage(HirakuImages[Math.floor(Math.random() * HirakuImages.length)])
		.setColor("#4338ca")
		.setTimestamp()
		.setFooter({
			text: "Hiraku",
		});

	const username = await router
		.users(data.user)
		.get()
		.catch(() => null);

	//LOG CHANNEL
	await router
		.channels("1198029086451314688")
		.messages.post({
			body: {
				content: `**${username?.username}** (ID: ${data.user}) voted! [Streak: ${streak}] ${
					data.isWeekend ? "🎉 Weekend bonus +2 vote streak" : ""
				}`,
			},
		})
		.catch(() => null);

	const channel = await router.users("@me").channels.post({
		body: {
			recipient_id: data.user,
		},
	});

	await router
		.channels(channel.id)
		.messages.post({
			body: {
				embeds: [embed.toJSON()],
			},
		})
		.catch(() => null);

	console.log(`[LOGS] ${data.user} voted! [Streak: ${streak}]`);
}

const membershipRolesIds = {
	"1097786564492394516": 5, // Tier I
	"1097786597073752166": 10, // Tier II
	"1097786598743097394": 15, // Tier III
};

/**
 *
 * Explain:
 * - Tokens base: 10
 * - Tokens streak: 1 per day, max 5
 * - Tokens votos: 1 per 5 votes
 * - Tokens total: tokens base + tokens streak + tokens votos
 */
function calculateToken(streak: number) {
	const tokensBase = 15;

	const tokensStreak = Math.min(streak, 5);
	const remainingStreak = streak - tokensStreak;

	const tokensVotos = Math.floor(remainingStreak / 5);

	return tokensBase + tokensStreak + tokensVotos;
}

const getMembership = async (userId: string): Promise<keyof typeof membershipRolesIds | null> => {
	const hirakuGuildId = "1095571707252715550";
	const memberOnGuild = await router
		.guilds(hirakuGuildId)
		.members(userId)
		.get()
		.catch(() => null);

	if (!memberOnGuild) return null;

	const memberRoles = memberOnGuild.roles;

	let currentMembership: keyof typeof membershipRolesIds | null = null;
	for (const roleId of Object.keys(membershipRolesIds)) {
		const searchRole = memberRoles.findIndex((mRole) => mRole === roleId);
		if (searchRole !== -1) {
			currentMembership = roleId as keyof typeof membershipRolesIds;
			break;
		}
	}

	return currentMembership;
};

export { processVote };
