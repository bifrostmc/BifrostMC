import checkUserHasPermission from '../utils/checkUserHasPermission';
import knex from '../database/';

let cacheChannels = [];
let cacheSuggestions = [];

class MessageReactionController {
	static async updateCache() {
		cacheChannels = await knex('channels');
		cacheSuggestions = await knex('suggestions');
	}

	constructor(bot) {
		this.bot = bot;

		MessageReactionController.updateCache();

		bot.on('raw', async (datas) => {
			if (
				datas.t !== 'MESSAGE_REACTION_ADD' &&
				datas.t !== 'MESSAGE_REACTION_REMOVE'
			)
				return;

			if (
				datas.t === 'MESSAGE_REACTION_ADD' &&
				cacheChannels.find(
					({ channel_id }) => channel_id === datas.d.channel_id
				)
			) {
				await this.suggestions(datas);
			}
		});
	}

	async suggestions(datas) {
		const { guild_id, channel_id, message_id } = datas.d;

		const suggestionId = cacheSuggestions.findIndex(
			(suggestionPreview) =>
				suggestionPreview.guild_id === guild_id &&
				suggestionPreview.channel_id === channel_id &&
				suggestionPreview.message_id === message_id
		);
		const suggestion = cacheSuggestions[suggestionId];

		if (!suggestion) return;

		const guild = this.bot.guilds.cache.get(suggestion.guild_id),
			member = guild.members.cache.get(suggestion.author_id);

		if (datas.d.user_id === suggestion.author_id || member.user.bot) return;

		const channel = guild.channels.cache.get(suggestion.channel_id),
			message = await channel.messages.fetch(suggestion.message_id);

		const emoji = datas.d.emoji.id || datas.d.emoji.name;

		const functionsCollection = {
			'745344787317784648': async (member) => {
				await member.send(
					`🎉 Parabéns sua sugestão abaixo foi aprovada, pelo admnistrador \`${member.user.tag}\`. 🎉`
				);
				await member.send(message.embeds[0].description);
				await channel
					.send(
						'🎉 A sugestão foi aprovada com sucesso! Obrigado pela colaboração 🎉'
					)
					.then((msg) => msg.delete({ timeout: 15000 }));
				message.delete();
				cacheSuggestions.slice(1, suggestionId);
				await knex('suggestions')
					.where({
						id: suggestion.id,
					})
					.del();
			},
			'745344786856280085': async (member) => {
				await member.send(
					`<:alert:745345548424314881> Infelizmente sua sugestão abaixo foi reprovado, pelo admnistrador \`${member.user.tag}\`. <:alert:745345548424314881>`
				);
				await member.send(message.embeds[0].description);
				await channel
					.send(
						'<:check_error:745344787087098008> A sugestão foi reprovado com sucesso! Obrigado pela colaboração <:check_error:745344787087098008>'
					)
					.then((msg) => msg.delete({ timeout: 15000 }));
				message.delete();
				cacheSuggestions.slice(1, suggestionId);
				await knex('suggestions')
					.where({
						id: suggestion.id,
					})
					.del();
			},
		};

		const functionExecution = functionsCollection[emoji];
		functionExecution(member);
	}
}

export default MessageReactionController;
