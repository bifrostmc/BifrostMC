import { MessageEmbed } from 'discord.js';

import moment from 'moment';

import server from '../../server';

export default async function registerRaffleTimeoutAndReactions(
	raffle,
	guild,
	channel,
	message
) {
	try {
		const { bot } = server.Bot;

		const dueDateInMS = moment(Number(raffle.due_date));
		const now = moment();
		const diference = moment.duration(dueDateInMS.diff(now)).asMilliseconds();
		const author = await guild.members.cache.get(raffle.author_id);

		const filterUserReactions = (reaction, user) =>
			reaction.emoji.name === '🎉' && user.id !== raffle.author_id;

		const collector = message.createReactionCollector(filterUserReactions);
		let quantityReactions = message.reactions.cache
			.get('🎉')
			.users.cache.filter((user) => user.id !== bot.user.id).size;

		collector.on('collect', async () => {
			quantityReactions = message.reactions.cache
				.get('🎉')
				.users.cache.filter((user) => user.id !== bot.user.id).size;

			try {
				const embedAdvertisement = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor(author.user.tag, author.user.avatarURL())
					.setThumbnail(guild.iconURL() || bot.user.avatarURL())
					.setTitle('Sorteio iniciado!')
					.setDescription(
						`**Descrição »** \`\`\`yaml\n${raffle.description}\`\`\``
					)
					.addField(
						'\u200B',
						`**Quantidade de membros participando »** ${quantityReactions}`
					)
					.addField('\u200B', `**Sorteio iniciado por »** <@${author.id}>`)
					.addField(
						'\u200B',
						`**Duração »** \`${dueDateInMS.format('HH:mm:ss - DD/MM/YYYY')}\``
					)
					.setTimestamp()
					.setFooter(
						`Copyright © 2020 ${bot.user.username}`,
						bot.user.avatarURL()
					);
				message.edit(embedAdvertisement);
			} catch (error) {
				console.log(error);
			}
		});
		setTimeout(async () => {
			const messageFinished = await channel.messages.fetch(raffle.message_id);
			const reactionsFinished = messageFinished.reactions.cache;
			const quantityReactionsFinished = reactionsFinished
				.get('🎉')
				.users.cache.filter((user) => user.id !== bot.user.id).size;
			const winner = reactionsFinished
				.get('🎉')
				.users.cache.filter((user) => user.id !== bot.user.id)
				.random();

			await message.delete();
			const embedFinishedRaffle = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(author.user.tag, author.user.avatarURL())
				.setThumbnail(guild.iconURL() || bot.user.avatarURL())
				.setTitle('🎉 Sorteio encerrado! 🎉')
				.setDescription(
					`**Descrição »** \`\`\`yaml\n${raffle.description}\`\`\``
				)
				.addField(
					'\u200B',
					`**Membros que participaram »** ${quantityReactionsFinished}`
				)
				.addField('\u200B', `**Sorteio iniciado por »** <@${author.id}>`)
				.addField('\u200B', `**Ganhador »** \`${winner.tag}\``)
				.setTimestamp()
				.setFooter(
					`Copyright © 2020 ${bot.user.username}`,
					bot.user.avatarURL()
				);

			winner.send(
				`🎉 ${winner} Parabéns!!! Você ganhou o seguinte sorteio » 🎉`
			);
			winner.send(`\`\`\`yaml\n${raffle.description}\`\`\``);
			author.send(`🎉 O usuário ${winner.tag} ganhou o seguinte sorteio » 🎉`);
			author.send(`\`\`\`yaml\n${raffle.description}\`\`\``);
			message.channel.send(embedFinishedRaffle);
		}, diference);
	} catch (error) {
		console.log(error);
	}
}
