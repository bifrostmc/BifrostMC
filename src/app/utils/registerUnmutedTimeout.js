import { MessageEmbed } from 'discord.js';

import moment from 'moment';

import CacheController from '../events/CacheController';
import server from '../../server';
import knex from '../database';

export default async function registerUnmutedTimeout(user_muted_id) {
	const { bot } = server.Bot;
	const mutedUser = await knex('muted')
		.where({
			user_muted_id,
		})
		.first();

	const dueDateInMS = moment(Number(mutedUser.due_date));
	const now = moment();
	const diference = moment.duration(dueDateInMS.diff(now)).asMilliseconds();

	const guild = server.Bot.bot.guilds.cache.get(mutedUser.guild_id);

	const userAuthor = await bot.users.fetch(mutedUser.author_id);
	const userMutedFetched = await guild.members.fetch(
		mutedUser.user_muted_id
	);

	const muterole = guild.roles.cache.find((role) => role.name === "Muted");

	setTimeout(async () => {
		try {
			await userMutedFetched.roles.remove(muterole);

			await knex('muted')
				.where({
					id: mutedUser.id,
				})
				.del();

			const unMuteEmbedNoticie = new MessageEmbed()
				.setAuthor(userMutedFetched.user.tag, userMutedFetched.user.avatarURL())
				.setThumbnail(guild.iconURL() || bot.user.avatarURL())
				.setTitle('Punição anulada!')
				.addField(
					'\u200B',
					`**Usuário desmutado »** \`${userMutedFetched.user.tag}\``
				)
				.addField('\u200B', `**Aplicação feita por »** \`${userAuthor.tag}\``)
				.addField('\u200B', `**Formato da punição »** \`Mute\``)
				.addField('\u200B', `**Motivo »** Prazo da punição finalizado`)
				.setTimestamp()
				.setFooter(
					`Copyright © 2020 ${bot.user.username}`,
					bot.user.avatarURL()
				);

			const channelsMutes = await knex('channels').where({
				function: 'muted',
				guild_id: guild.id
			});
			channelsMutes
				.map((channelBanned) => {
					const channelInGuild = guild.channels.cache.get(
						channelBanned.channel_id
					);

					return channelInGuild.send(unMuteEmbedNoticie);
				});
		} catch (error) {
			console.log(error);
		}
	}, diference);
}
