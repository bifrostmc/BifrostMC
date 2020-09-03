import knex from '../database';

class MessageReactionController {
	constructor(bot) {
		this.bot = bot;

		bot.on('raw', async (datas) => {
			if (datas.t !== 'MESSAGE_REACTION_ADD') return;

			if (!bot.cache_control.channels.get('sugestoes'))
				return;

			if (
				bot.cache_control.channels.get('sugestoes').channel_id ===
				datas.d.channel_id
			) {
				await this.suggestions(datas);
			}
		});
	}

	async suggestions(datas) {
		const { message_id } = datas.d;

		const suggestion = this.bot.cache_control.suggestions.get(message_id);

		if (!suggestion) return;

		const guild = this.bot.guilds.cache.get(suggestion.guild_id);
		const member = guild.members.cache.get(suggestion.author_id);

		if (datas.d.user_id === suggestion.author_id || member.user.bot) return;

		const channel = guild.channels.cache.get(suggestion.channel_id);
		const message = await channel.messages.fetch(suggestion.message_id);

		const emoji = datas.d.emoji.id || datas.d.emoji.name;

		const functionsCollection = {
			'745344787317784648': async () => {
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
				this.bot.cache_control.suggestions.delete(message_id);
				await knex('suggestions')
					.where({
						id: suggestion.id,
					})
					.del();
			},
			'745344786856280085': async () => {
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
				this.bot.cache_control.suggestions.delete(message_id);
				await knex('suggestions')
					.where({
						id: suggestion.id,
					})
					.del();
			},
		};

		const functionExecution = functionsCollection[emoji];
		functionExecution();
	}
}

export default MessageReactionController;
