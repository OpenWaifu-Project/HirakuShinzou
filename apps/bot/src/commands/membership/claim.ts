import { type CommandContext, Declare, SubCommand } from "seyfert";
import { constants } from "../../lib/constants";
import { UserService } from "@repo/database";
import { inject } from "inversify";

const membershipRolesIds = {
	"1097786564492394516": "Tier-i", // Tier I
	"1097786597073752166": "Tier-ii", // Tier II
	"1097786598743097394": "Tier-iii", // Tier III
} as const;
const hirakuGuildId = "1095571707252715550";

@Declare({
	name: "claim",
	description: "Claim your membership",
})
export default class MembershipClaimCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<never, "prepare">) {
		const lang = ctx.metadata.prepare.lang.commands.membership;

		const memberOnGuild = await ctx.client.members.fetch(hirakuGuildId, ctx.author.id, true);

		if (!memberOnGuild) {
			return ctx.editOrReply({
				content: lang.claim.userMissingInGuild,
			});
		}

		const memberRoles = memberOnGuild.roles.keys;
		const matchingRole = memberRoles.find((mRole) => Object.hasOwn(membershipRolesIds, mRole));
		if (!matchingRole) {
			return ctx.editOrReply({ content: lang.claim.noMembershipFound });
		}

		const currentMembership = membershipRolesIds[matchingRole as keyof typeof membershipRolesIds];

		if (!currentMembership) {
			return ctx.editOrReply({
				content: lang.claim.noMembershipFound,
			});
		}

		const newMembership = constants.MEMBERSHIPS[currentMembership];
		if (ctx.metadata.prepare.user.membership.plan === newMembership.name) {
			return ctx.editOrReply({
				content: lang.claim.alreadyClaimed,
			});
		}

		await this.userService.updateTokens(ctx.author.id, "image", newMembership.imageTokens);
		await this.userService.updateTokens(ctx.author.id, "chat", newMembership.chatTokens);
		await this.userService.updateUser(ctx.author.id, {
			membership: {
				plan: newMembership.name,
				since: Date.now(),
				expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
			},
		});

		return ctx.editOrReply({
			content: lang.claim.success({
				membership: newMembership.name,
				tokens: newMembership.imageTokens,
			}),
		});
	}
}
